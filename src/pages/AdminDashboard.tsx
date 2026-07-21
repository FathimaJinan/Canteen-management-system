import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { toast } from "sonner";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Store,
  Plus,
  Trash2,
  Edit2,
  Layers,
  IndianRupee,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

// Default local mock data if server analytics fail
const MOCK_DAILY_SALES = [
  { date: "2026-07-10", orders: 12, revenue: 840 },
  { date: "2026-07-11", orders: 18, revenue: 1250 },
  { date: "2026-07-12", orders: 15, revenue: 1050 },
  { date: "2026-07-13", orders: 25, revenue: 1950 },
  { date: "2026-07-14", orders: 30, revenue: 2400 },
  { date: "2026-07-15", orders: 28, revenue: 2150 },
  { date: "2026-07-16", orders: 35, revenue: 2890 },
];

const MOCK_SHOP_SALES = [
  { shopName: "Annapurna South Indian", ordersCount: 55, revenue: 3200 },
  { shopName: "Spice Junction", ordersCount: 42, revenue: 4100 },
  { shopName: "Quick Bites & Juice Bar", ordersCount: 68, revenue: 2950 },
];

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  // States
  const [selectedTab, setSelectedTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>("all");
  
  // Onboard Shopkeeper form state
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    email: "",
    password: "",
    shopId: "",
    shopName: "",
    shopDescription: "",
    shopImage: "",
  });

  // Menu item modal state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    preparationTime: "",
    shopId: "",
    stockQuantity: "",
  });

  // Redirect if not admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // Fetch all dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch shops
      let fetchedShops = [];
      try {
        fetchedShops = await api.getShops();
        setShops(fetchedShops);
      } catch (err) {
        console.warn("Backend shops load failed, using local storage fallback");
        const localShops = localStorage.getItem("zappadu_shops");
        fetchedShops = localShops ? JSON.parse(localShops) : [];
        setShops(fetchedShops);
      }

      // 2. Fetch analytics
      try {
        const stats = await api.getSalesAnalytics();
        setAnalytics(stats);
      } catch (err) {
        console.warn("Backend sales analytics load failed, using local mock fallback");
        // Simulated summary based on localStorage orders
        const ordersStr = localStorage.getItem("zappadu_orders") || "[]";
        const orders = JSON.parse(ordersStr);
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        
        setAnalytics({
          summary: {
            totalOrders: orders.length,
            totalRevenue,
            totalUsers: 6,
            studentCount: 3,
            shopkeeperCount: 3,
            totalShops: fetchedShops.length,
            totalMenuItems: 16,
          },
          dailySales: MOCK_DAILY_SALES,
          shopSales: MOCK_SHOP_SALES,
        });
      }

      // 3. Fetch menu items
      try {
        const items = await api.getMenuItems();
        setMenuItems(items);
      } catch (err) {
        console.warn("Backend menu items load failed, using local storage fallback");
        const itemsStr = localStorage.getItem("zappadu_menu_items");
        const items = itemsStr ? JSON.parse(itemsStr) : [];
        setMenuItems(items);
      }
    } catch (err: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Onboard Shopkeeper Submit
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.email || !onboardForm.password || !onboardForm.shopId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await api.onboardShopkeeper(onboardForm);
      toast.success(`Successfully onboarded shopkeeper for shop: ${onboardForm.shopId}!`);
      // Reset form
      setOnboardForm({
        name: "",
        email: "",
        password: "",
        shopId: "",
        shopName: "",
        shopDescription: "",
        shopImage: "",
      });
      fetchData();
    } catch (err: any) {
      // Local fallback for onboarding
      console.warn("Backend onboard failed, attempting local fallback:", err);
      const usersStr = localStorage.getItem("zappadu_users") || "[]";
      const users = JSON.parse(usersStr);
      if (users.some((u: any) => u.email === onboardForm.email)) {
        toast.error("Email already registered in local storage");
        return;
      }
      
      const newShopkeeper = {
        id: Date.now().toString(),
        name: onboardForm.name,
        email: onboardForm.email,
        password: onboardForm.password,
        role: "shop_owner",
        shopId: onboardForm.shopId,
      };

      localStorage.setItem("zappadu_users", JSON.stringify([...users, newShopkeeper]));

      // Create shop if doesn't exist
      const localShopsStr = localStorage.getItem("zappadu_shops") || "[]";
      const localShops = JSON.parse(localShopsStr);
      if (!localShops.some((s: any) => s.id === onboardForm.shopId)) {
        const newShop = {
          id: onboardForm.shopId,
          name: onboardForm.shopName || `${onboardForm.name}'s Stall`,
          description: onboardForm.shopDescription || "Fresh canteen food",
          image: onboardForm.shopImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
          isOpen: true,
        };
        localStorage.setItem("zappadu_shops", JSON.stringify([...localShops, newShop]));
      }

      toast.success("[DEMO] Shopkeeper onboarded in local storage!");
      setOnboardForm({
        name: "",
        email: "",
        password: "",
        shopId: "",
        shopName: "",
        shopDescription: "",
        shopImage: "",
      });
      fetchData();
    }
  };

  // Open modal for Adding Item
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setMenuForm({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      preparationTime: "",
      shopId: selectedShopId !== "all" ? selectedShopId : "",
      stockQuantity: "",
    });
    setIsMenuModalOpen(true);
  };

  // Open modal for Editing Item
  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      preparationTime: item.preparationTime.toString(),
      shopId: item.shopId,
      stockQuantity: (item.stockQuantity ?? 10).toString(),
    });
    setIsMenuModalOpen(true);
  };

  // Save Menu Item (Add or Edit)
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price || !menuForm.category || !menuForm.shopId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      name: menuForm.name,
      description: menuForm.description,
      price: Number(menuForm.price),
      image: menuForm.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      category: menuForm.category,
      preparationTime: Number(menuForm.preparationTime || 10),
      shopId: menuForm.shopId,
      stockQuantity: Number(menuForm.stockQuantity || 0),
    };

    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem._id || editingItem.id, payload);
        toast.success("Menu item updated successfully!");
      } else {
        await api.addMenuItem(payload);
        toast.success("Menu item added successfully!");
      }
      setIsMenuModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.warn("Backend menu save failed, using local storage fallback:", err);
      
      const itemsStr = localStorage.getItem("zappadu_menu_items") || "[]";
      let items = JSON.parse(itemsStr);

      if (editingItem) {
        items = items.map((it: any) => 
          (it.id === editingItem.id) 
            ? { ...it, ...payload, available: payload.stockQuantity > 0 } 
            : it
        );
        toast.success("[DEMO] Item updated in local storage");
      } else {
        const newItem = {
          id: Date.now().toString(),
          ...payload,
          available: payload.stockQuantity > 0,
        };
        items.push(newItem);
        toast.success("[DEMO] Item added to local storage");
      }

      localStorage.setItem("zappadu_menu_items", JSON.stringify(items));
      setIsMenuModalOpen(false);
      fetchData();
    }
  };

  // Delete Menu Item
  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      await api.deleteMenuItem(id);
      toast.success("Menu item deleted successfully!");
      fetchData();
    } catch (err) {
      console.warn("Backend delete item failed, using local storage fallback");
      const itemsStr = localStorage.getItem("zappadu_menu_items") || "[]";
      const items = JSON.parse(itemsStr);
      const filtered = items.filter((it: any) => it.id !== id);
      localStorage.setItem("zappadu_menu_items", JSON.stringify(filtered));
      toast.success("[DEMO] Menu item removed from local storage");
      fetchData();
    }
  };

  // Filtering global menu items
  const filteredMenuItems = menuItems.filter((item) => {
    if (selectedShopId === "all") return true;
    return item.shopId === selectedShopId;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">System-wide monitoring, shop onboarding, and global menu management</p>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Overview & Charts
            </TabsTrigger>
            <TabsTrigger value="onboard" className="gap-2">
              <UserPlus className="h-4 w-4" /> Onboard Shopkeeper
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-2">
              <Layers className="h-4 w-4" /> Global Menu Manager
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                      <p className="text-3xl font-extrabold text-primary flex items-center mt-1">
                        <IndianRupee className="h-6 w-6 mr-0.5" />
                        {analytics?.summary?.totalRevenue ?? 0}
                      </p>
                    </div>
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
                      <p className="text-3xl font-extrabold mt-1">{analytics?.summary?.totalOrders ?? 0}</p>
                    </div>
                    <div className="p-3 bg-secondary/10 text-secondary-foreground rounded-xl">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                      <p className="text-3xl font-extrabold mt-1">{analytics?.summary?.totalUsers ?? 0}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {analytics?.summary?.studentCount ?? 0} Students | {analytics?.summary?.shopkeeperCount ?? 0} Shopkeepers
                      </p>
                    </div>
                    <div className="p-3 bg-success/10 text-success rounded-xl">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Active Stalls</p>
                      <p className="text-3xl font-extrabold mt-1">{analytics?.summary?.totalShops ?? 0}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {analytics?.summary?.totalMenuItems ?? 0} global food items
                      </p>
                    </div>
                    <div className="p-3 bg-warning/10 text-warning rounded-xl">
                      <Store className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Daily Sales Chart */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Daily Sales Revenue (₹)</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.dailySales || MOCK_DAILY_SALES}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Shop Revenue Breakdown */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Revenue breakdown by Canteen Stall</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.shopSales || MOCK_SHOP_SALES}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="shopName" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Revenue (₹)" />
                      <Bar dataKey="ordersCount" fill="hsl(var(--secondary-foreground))" radius={[8, 8, 0, 0]} name="Orders Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onboard Shopkeeper Tab */}
          <TabsContent value="onboard">
            <Card className="max-w-2xl mx-auto glass-card animate-slide-up">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" /> Onboard Canteen Shopkeeper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOnboardSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Shopkeeper Name *</label>
                      <Input
                        placeholder="John Doe"
                        value={onboardForm.name}
                        onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Shopkeeper Email *</label>
                      <Input
                        type="email"
                        placeholder="john@zappadu.com"
                        value={onboardForm.email}
                        onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Temporary Password *</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={onboardForm.password}
                        onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Stall ID (Unique Slug) *</label>
                      <Input
                        placeholder="shop4"
                        value={onboardForm.shopId}
                        onChange={(e) => setOnboardForm({ ...onboardForm, shopId: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-2">
                    <h3 className="text-sm font-bold text-muted-foreground mb-3">Optional Stall Info (Auto-creates Shop profile)</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Stall/Shop Name</label>
                        <Input
                          placeholder="e.g. Chat Corner"
                          value={onboardForm.shopName}
                          onChange={(e) => setOnboardForm({ ...onboardForm, shopName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Stall Description</label>
                        <Input
                          placeholder="Fresh and tasty snacks, chats and panipuri."
                          value={onboardForm.shopDescription}
                          onChange={(e) => setOnboardForm({ ...onboardForm, shopDescription: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Stall Banner Image URL</label>
                        <Input
                          placeholder="https://images.unsplash.com/..."
                          value={onboardForm.shopImage}
                          onChange={(e) => setOnboardForm({ ...onboardForm, shopImage: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-6" disabled={loading}>
                    {loading ? "Onboarding..." : "Register Shopkeeper & Stall"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Management Tab */}
          <TabsContent value="menu">
            <Card className="glass-card animate-slide-up">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
                <div>
                  <CardTitle className="text-xl font-bold">Global Menu Manager</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage menu cards, prices, and stock quantities across all stalls</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-48">
                    <Select value={selectedShopId} onValueChange={setSelectedShopId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by Stall" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stalls</SelectItem>
                        {shops.map((s) => (
                          <SelectItem key={s.shopId || s.id} value={s.shopId || s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleOpenAddModal} className="gap-1">
                    <Plus className="h-4 w-4" /> Add Food Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Stall ID</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMenuItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No menu items found. Add items to list them here.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMenuItems.map((item) => (
                          <TableRow key={item._id || item.id}>
                            <TableCell className="font-semibold flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover" />
                              <div>
                                <p>{item.name}</p>
                                <p className="text-xs text-muted-foreground font-normal max-w-xs truncate">{item.description}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.shopId}</Badge>
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>₹{item.price}</TableCell>
                            <TableCell className="font-bold">
                              {item.stockQuantity ?? 10} units
                            </TableCell>
                            <TableCell>
                              <Badge className={item.available && (item.stockQuantity ?? 10) > 0 ? "bg-success" : "bg-destructive"}>
                                {item.available && (item.stockQuantity ?? 10) > 0 ? "Available" : "Out of Stock"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(item)}>
                                <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteMenuItem(item._id || item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Menu item modal (Add / Edit) */}
      <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveMenuItem}>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
              <DialogDescription>
                Fill in the details to update the global menu catalogue
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Food Name *</label>
                <Input
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  placeholder="e.g. Masala Dosa"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <Input
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  placeholder="e.g. Golden crispy paper dosa served with tomato chutney..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Price (₹) *</label>
                  <Input
                    type="number"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    placeholder="50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Stock Quantity *</label>
                  <Input
                    type="number"
                    value={menuForm.stockQuantity}
                    onChange={(e) => setMenuForm({ ...menuForm, stockQuantity: e.target.value })}
                    placeholder="15"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Category *</label>
                  <Input
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    placeholder="e.g. South Indian"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Stall Association *</label>
                  <Select
                    value={menuForm.shopId}
                    onValueChange={(val) => setMenuForm({ ...menuForm, shopId: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Stall" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((s) => (
                        <SelectItem key={s.shopId || s.id} value={s.shopId || s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Preparation Time (mins)</label>
                  <Input
                    type="number"
                    value={menuForm.preparationTime}
                    onChange={(e) => setMenuForm({ ...menuForm, preparationTime: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Image URL</label>
                  <Input
                    value={menuForm.image}
                    onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsMenuModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? "Save Changes" : "Create Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;
