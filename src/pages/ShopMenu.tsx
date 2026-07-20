import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import MenuCard from "@/components/menu/MenuCard";
import { getMenuByShop } from "@/data/menuItems";
import { shops } from "@/data/shops";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { api } from "@/services/api";
import { MenuItem } from "@/types";

const ShopMenu: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const shop = shops.find((s) => s.id === shopId);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { getTotalItems, getTotalAmount } = useCart();
  const totalItems = getTotalItems();

  if (!shop) return <Navigate to="/dashboard" replace />;

  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await api.getMenuItems(shop.id);
        setItems(data);
      } catch (err) {
        console.warn("Backend menu items fetch failed, using local fallback");
        const localStr = localStorage.getItem("zappadu_menu_items");
        if (localStr) {
          const filtered = JSON.parse(localStr).filter((it: any) => it.shopId === shop.id);
          setItems(filtered);
        } else {
          setItems(getMenuByShop(shop.id));
        }
      }
    };
    fetchItems();
  }, [shop.id]);

  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back + Shop Info */}
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-3">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shops
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <img src={shop.image} alt={shop.name} className="h-16 w-16 rounded-xl object-cover" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{shop.name}</h1>
              <p className="text-muted-foreground text-sm">{shop.description}</p>
            </div>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search menu items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button key={category} variant={activeCategory === category ? "default" : "secondary"} size="sm" onClick={() => setActiveCategory(category)} className="rounded-full">
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found matching your search.</p>
          </div>
        )}

        {/* Floating Cart */}
        {totalItems > 0 && (
          <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-auto z-50 animate-slide-up">
            <Link to="/cart">
              <Button className="w-full md:w-auto h-14 text-lg shadow-lg px-6" variant="hero">
                <ShoppingCart className="mr-2 h-5 w-5" />
                View Cart
                <Badge className="ml-2 bg-primary-foreground text-primary">
                  {totalItems} items • ₹{getTotalAmount()}
                </Badge>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShopMenu;
