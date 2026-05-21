import React, { createContext, useContext, useState, ReactNode } from "react";
import { Order, CartItem, OrderStatus } from "@/types";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { shops } from "@/data/shops";

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  placeOrder: (items: CartItem[], paymentMethod: 'pay_now' | 'pay_later', shopId: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrdersByStudent: (studentId: string) => Order[];
  getOrdersByShop: (shopId: string) => Order[];
  getAllOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { user } = useAuth();

  const placeOrder = (items: CartItem[], paymentMethod: 'pay_now' | 'pay_later', shopId: string): Order => {
    const totalAmount = items.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
    const maxPrepTime = Math.max(...items.map((item) => item.menuItem.preparationTime));
    const estimatedReadyTime = new Date(Date.now() + maxPrepTime * 60 * 1000);
    const shop = shops.find(s => s.id === shopId);

    const newOrder: Order = {
      id: `ORD${Date.now().toString().slice(-6)}`,
      items,
      totalAmount,
      status: "pending",
      paymentMethod,
      paymentStatus: paymentMethod === "pay_now" ? "paid" : "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedReadyTime,
      studentId: user?.id || "",
      studentName: user?.name || "Guest",
      shopId,
      shopName: shop?.name || "Unknown Shop",
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    toast.success(`Order #${newOrder.id} placed at ${shop?.name}!`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date() }
          : order
      )
    );
    if (currentOrder?.id === orderId) {
      setCurrentOrder((prev) => (prev ? { ...prev, status } : null));
    }
    const statusMessages: Record<OrderStatus, string> = {
      pending: "Order is pending",
      accepted: "Order accepted by shop!",
      preparing: "Your order is being prepared",
      ready: "🔔 Your order is ready for pickup!",
      collected: "Order collected. Enjoy your meal!",
      cancelled: "Order has been cancelled",
    };
    toast.info(statusMessages[status]);
  };

  const getOrdersByStudent = (studentId: string) =>
    orders.filter((order) => order.studentId === studentId);

  const getOrdersByShop = (shopId: string) =>
    orders.filter((order) => order.shopId === shopId);

  const getAllOrders = () => orders;

  return (
    <OrderContext.Provider
      value={{ orders, currentOrder, placeOrder, updateOrderStatus, getOrdersByStudent, getOrdersByShop, getAllOrders }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
