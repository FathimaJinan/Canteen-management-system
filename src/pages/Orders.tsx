import React from "react";
import { Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import OrderCard from "@/components/order/OrderCard";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, ArrowRight, ClipboardList } from "lucide-react";

const Orders: React.FC = () => {
  const { getOrdersByStudent } = useOrders();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userOrders = getOrdersByStudent(user?.id || "");

  if (userOrders.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="h-24 w-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start browsing shops and place your first order!</p>
            <Link to="/dashboard">
              <Button variant="hero" size="lg">
                Browse Shops <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          My <span className="gradient-text">Orders</span>
        </h1>
        <p className="text-muted-foreground mb-8">Track your current and past orders</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
