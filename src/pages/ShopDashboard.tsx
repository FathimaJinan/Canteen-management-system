import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { shops } from "@/data/shops";
import { getMenuByShop } from "@/data/menuItems";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { OrderStatus, MenuItem } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import {
  Store,
  Bell,
  ShoppingBag,
  Utensils,
  IndianRupee,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  ChefHat,
  Package,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";

const ShopDashboard: React.FC = () => {
  const { user, isAuthenticated, isShopOwner } = useAuth();
  const { getOrdersByShop, updateOrderStatus, refreshOrders } = useOrders();
  const [selectedTab, setSelectedTab] = useState("new-orders");

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Modal Form State
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    preparationTime: "",
    stockQuantity: "",
  });

  if (!isAuthenticated || !isShopOwner) {
    return <Navigate to="/login" replace />;
  }

  const shopId = user?.shopId || "";
  const shop = shops.find((s) => s.id === shopId);
  const shopOrders = getOrdersByShop(shopId);

  // Fetch shop menu items
  const fetchMenu = async () => {
    try {
      const items = await api.getMenuItems(shopId);
      setMenuItems(items);
    } catch (err) {
      console.warn("Backend menu fetch failed, using local storage/fallback");
      const localStr = localStorage.getItem("zappadu_menu_items");
      if (localStr) {
        const items = JSON.parse(localStr).filter((it: any) => it.shopId === shopId);
        setMenuItems(items);
      } else {
        setMenuItems(getMenuByShop(shopId));
      }
    }
  };

  useEffect(() => {
    fetchMenu();
    // Auto-refresh orders when dashboard opens
    refreshOrders();
  }, [shopId]);

  const newOrders = shopOrders.filter((o) => o.status === "pending");
  const acceptedOrders = shopOrders.filter((o) => o.status === "accepted" || o.status === "preparing");
  const readyOrders = shopOrders.filter((o) => o.status === "ready");
  const completedOrders = shopOrders.filter((o) => o.status === "collected");

  const todayRevenue = shopOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = [
    { label: "New Orders", value: newOrders.length, icon: <Bell className="h-5 w-5" />, color: "text-destructive" },
    { label: "Preparing", value: acceptedOrders.length, icon: <ChefHat className="h-5 w-5" />, color: "text-warning" },
    { label: "Ready", value: readyOrders.length, icon: <Package className="h-5 w-5" />, color: "text-success" },
    { label: "Revenue", value: `₹${todayRevenue}`, icon: <TrendingUp className="h-5 w-5" />, color: "text-primary" },
  ];

  const handleAccept = (orderId: string) => updateOrderStatus(orderId, "accepted");
  const handlePreparing = (orderId: string) => updateOrderStatus(orderId, "preparing");
  const handleReady = (orderId: string) => updateOrderStatus(orderId, "ready");
  const handleCollected = (orderId: string) => updateOrderStatus(orderId, "collected");
  const handleCancel = (orderId: string) => updateOrderStatus(orderId, "cancelled");

  // Open modal for Adding Item
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setMenuForm({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      preparationTime: "10",
      stockQuantity: "15",
    });
    setIsMenuModalOpen(true);
  };

  // Open modal for Editing Item
  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      preparationTime: item.preparationTime.toString(),
      stockQuantity: (item.stockQuantity ?? 10).toString(),
    });
    setIsMenuModalOpen(true);
  };

  // Save (Add or Edit) MenuItem
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price || !menuForm.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      name: menuForm.name,
      description: menuForm.description,
      price: Number(menuForm.price),
      image: menuForm.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      category: menuForm.category,
      preparationTime: Number(menuForm.preparationTime),
      shopId,
      stockQuantity: Number(menuForm.stockQuantity),
    };

    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem._id || editingItem.id, payload);
        toast.success("Item updated successfully!");
      } else {
        await api.addMenuItem(payload);
        toast.success("Item added successfully!");
      }
      setIsMenuModalOpen(false);
      fetchMenu();
    } catch (err: any) {
      console.warn("Backend menu update failed, attempting local fallback:", err);
      // Fallback
      const localStr = localStorage.getItem("zappadu_menu_items") || "[]";
      let localItems = JSON.parse(localStr);

      if (editingItem) {
        localItems = localItems.map((it: any) =>
          (it.id === editingItem.id)
            ? { ...it, ...payload, available: payload.stockQuantity > 0 }
            : it
        );
        toast.success("[DEMO] Item updated locally");
      } else {
        const newItem = {
          id: Date.now().toString(),
          ...payload,
          available: payload.stockQuantity > 0,
        };
        localItems.push(newItem);
        toast.success("[DEMO] Item added locally");
      }

      localStorage.setItem("zappadu_menu_items", JSON.stringify(localItems));
      setIsMenuModalOpen(false);
      fetchMenu();
    }
  };

  // Delete MenuItem
  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await api.deleteMenuItem(id);
      toast.success("Item deleted successfully!");
      fetchMenu();
    } catch (err) {
      console.warn("Backend delete item failed, using local storage fallback");
      const localStr = localStorage.getItem("zappadu_menu_items") || "[]";
      const localItems = JSON.parse(localStr);
      const filtered = localItems.filter((it: any) => it.id !== id);
      localStorage.setItem("zappadu_menu_items", JSON.stringify(filtered));
      toast.success("[DEMO] Item removed locally");
      fetchMenu();
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{shop?.name || "Shop"} Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage your orders and menu</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1 p-1 bg-muted">
            <TabsTrigger value="new-orders" className="gap-2">
              <Bell className="h-4 w-4" />
              New Orders
              {newOrders.length > 0 && <Badge className="ml-1 bg-destructive text-destructive-foreground">{newOrders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <ChefHat className="h-4 w-4" />
              Active
              {acceptedOrders.length > 0 && <Badge className="ml-1">{acceptedOrders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="ready" className="gap-2">
              <Package className="h-4 w-4" />
              Ready
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Utensils className="h-4 w-4" />
              Inventory & Stock
            </TabsTrigger>
          </TabsList>

          {/* New Orders Tab */}
          <TabsContent value="new-orders">
            {newOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No new orders right now</p>
                  <p className="text-sm text-muted-foreground mt-1">New orders will appear here automatically</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {newOrders.map((order) => (
                  <Card key={order.id || order._id} className="border-l-4 border-l-destructive animate-slide-up">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">#{order.id}</span>
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">NEW</Badge>
                            <Badge variant="outline" className={order.paymentStatus === "paid" ? "bg-success/10 text-success border-success/30 font-medium" : "bg-warning/10 text-warning border-warning/30 font-medium"}>
                              {order.paymentStatus === "paid" ? "✓ Paid" : "Pay at Counter"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{order.studentName}</span> • {format(new Date(order.createdAt), "hh:mm a")}
                          </p>
                          <div className="text-sm space-y-1">
                            {order.items.map((item) => (
                              <div key={item.menuItem.id || item.menuItem._id} className="flex items-center gap-2">
                                <span>{item.name || item.menuItem.name}</span>
                                <span className="text-muted-foreground">×{item.quantity}</span>
                                <span className="text-muted-foreground">₹{(item.price || item.menuItem.price) * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <p className="font-bold text-lg flex items-center text-primary">
                            <IndianRupee className="h-4 w-4" />
                            {order.totalAmount}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleAccept(order._id || order.id)} className="gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Accept
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleCancel(order._id || order.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Orders Tab */}
          <TabsContent value="active">
            {acceptedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders being prepared</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {acceptedOrders.map((order) => (
                  <Card key={order.id || order._id} className="border-l-4 border-l-warning">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">#{order.id}</span>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">{order.studentName}</p>
                          <div className="text-sm">
                            {order.items.map((item) => (
                              <span key={item.menuItem.id || item.menuItem._id} className="mr-3 font-medium">
                                {item.name || item.menuItem.name} ×{item.quantity}
                              </span>
                            ))}
                          </div>
                          <p className="font-semibold flex items-center mt-1">
                            <IndianRupee className="h-4 w-4" />
                            {order.totalAmount}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {order.status === "accepted" && (
                            <Button onClick={() => handlePreparing(order._id || order.id)} variant="secondary" className="gap-1">
                              <ChefHat className="h-4 w-4" />
                              Start Preparing
                            </Button>
                          )}
                          {order.status === "preparing" && (
                            <Button onClick={() => handleReady(order._id || order.id)} className="gap-1 bg-success hover:bg-success/90">
                              <Package className="h-4 w-4" />
                              Mark Ready
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Ready Tab */}
          <TabsContent value="ready">
            {readyOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders ready for pickup</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {readyOrders.map((order) => (
                  <Card key={order.id || order._id} className="border-l-4 border-l-success">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">#{order.id}</span>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">{order.studentName}</p>
                          <p className="font-semibold flex items-center"><IndianRupee className="h-4 w-4" />{order.totalAmount}</p>
                        </div>
                        <Button onClick={() => handleCollected(order._id || order.id)} variant="outline" className="gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Collected
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <Card key={order.id || order._id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">#{order.id}</span>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">{order.studentName} • {format(new Date(order.createdAt), "hh:mm a")}</p>
                        </div>
                        <p className="font-semibold flex items-center"><IndianRupee className="h-4 w-4" />{order.totalAmount}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="glass-card animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <div>
                  <CardTitle className="text-xl font-bold">Stall Inventory catalogue</CardTitle>
                  <p className="text-sm text-muted-foreground">Add, remove and manage stock quantities of your food items</p>
                </div>
                <Button onClick={handleOpenAddModal} className="gap-1">
                  <Plus className="h-4 w-4" /> Add Food Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Food Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No menu items found. Click 'Add Food Item' to create menu items.
                          </TableCell>
                        </TableRow>
                      ) : (
                        menuItems.map((item) => (
                          <TableRow key={item._id || item.id}>
                            <TableCell className="font-semibold flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover" />
                              <div>
                                <p>{item.name}</p>
                                <p className="text-xs text-muted-foreground font-normal max-w-xs truncate">{item.description}</p>
                              </div>
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>₹{item.price}</TableCell>
                            <TableCell className="font-bold">
                              {item.stockQuantity ?? 10} units
                            </TableCell>
                            <TableCell>
                              <Badge className={item.available && (item.stockQuantity ?? 10) > 0 ? "bg-success" : "bg-destructive"}>
                                {item.available && (item.stockQuantity ?? 10) > 0 ? "In Stock" : "Out of Stock"}
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

      {/* Menu Item Dialog Modal */}
      <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveMenuItem}>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
              <DialogDescription>
                Update food name, description, category, prep time and active stock quantity.
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
                  placeholder="e.g. Traditional crispy dosa..."
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
                  <label className="text-sm font-semibold">Preparation Time (mins)</label>
                  <Input
                    type="number"
                    value={menuForm.preparationTime}
                    onChange={(e) => setMenuForm({ ...menuForm, preparationTime: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Image URL</label>
                <Input
                  value={menuForm.image}
                  onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
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

export default ShopDashboard;
