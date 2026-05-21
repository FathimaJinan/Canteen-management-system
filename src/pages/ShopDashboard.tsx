import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { shops } from "@/data/shops";
import { getMenuByShop } from "@/data/menuItems";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { OrderStatus } from "@/types";
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
} from "lucide-react";
import { format } from "date-fns";

const ShopDashboard: React.FC = () => {
  const { user, isAuthenticated, isShopOwner } = useAuth();
  const { getOrdersByShop, updateOrderStatus } = useOrders();
  const [selectedTab, setSelectedTab] = useState("new-orders");

  if (!isAuthenticated || !isShopOwner) {
    return <Navigate to="/login" replace />;
  }

  const shop = shops.find((s) => s.id === user?.shopId);
  const shopOrders = getOrdersByShop(user?.shopId || "");
  const shopMenu = getMenuByShop(user?.shopId || "");

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <Store className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{shop?.name || "Shop"} Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage your orders and menu</p>
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
          <TabsList className="mb-6">
            <TabsTrigger value="new-orders" className="gap-2">
              <Bell className="h-4 w-4" />
              New Orders
              {newOrders.length > 0 && <Badge className="ml-1 bg-destructive">{newOrders.length}</Badge>}
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
                  <Card key={order.id} className="border-l-4 border-l-destructive animate-slide-up">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">#{order.id}</span>
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">NEW</Badge>
                            <Badge variant="outline">{order.paymentStatus === "paid" ? "✓ Paid Online" : "Pay at Counter"}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{order.studentName}</span> • {format(new Date(order.createdAt), "hh:mm a")}
                          </p>
                          <div className="text-sm space-y-1">
                            {order.items.map((item) => (
                              <div key={item.menuItem.id} className="flex items-center gap-2">
                                <span>{item.menuItem.name}</span>
                                <span className="text-muted-foreground">×{item.quantity}</span>
                                <span className="text-muted-foreground">₹{item.menuItem.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <p className="font-bold text-lg flex items-center text-primary">
                            <IndianRupee className="h-4 w-4" />
                            {order.totalAmount}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleAccept(order.id)} className="gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Accept
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleCancel(order.id)}>
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
                  <Card key={order.id} className="border-l-4 border-l-warning">
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
                              <span key={item.menuItem.id} className="mr-2">{item.menuItem.name} ×{item.quantity}</span>
                            ))}
                          </div>
                          <p className="font-semibold flex items-center"><IndianRupee className="h-4 w-4" />{order.totalAmount}</p>
                        </div>
                        <div className="flex gap-2">
                          {order.status === "accepted" && (
                            <Button onClick={() => handlePreparing(order.id)} variant="secondary" className="gap-1">
                              <ChefHat className="h-4 w-4" />
                              Start Preparing
                            </Button>
                          )}
                          {order.status === "preparing" && (
                            <Button onClick={() => handleReady(order.id)} className="gap-1 bg-success hover:bg-success/90">
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
                  <Card key={order.id} className="border-l-4 border-l-success">
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
                        <Button onClick={() => handleCollected(order.id)} variant="outline" className="gap-1">
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
                  <Card key={order.id} className="opacity-75">
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default ShopDashboard;
