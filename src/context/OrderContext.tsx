import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Order, CartItem, OrderStatus } from "@/types";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { shops } from "@/data/shops";
import { api } from "@/services/api";

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  placeOrder: (
    items: CartItem[],
    paymentMethod: 'pay_now' | 'pay_later' | 'wallet' | 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'razorpay_googlepay',
    shopId: string,
    fee?: number,
    gst?: number,
    pickupTimeSlot?: string
  ) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrdersByStudent: (studentId: string) => Order[];
  getOrdersByShop: (shopId: string) => Order[];
  getAllOrders: () => Order[];
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem("zappadu_orders");
    if (!savedOrders) return [];
    try {
      const parsed = JSON.parse(savedOrders);
      return parsed.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        estimatedReadyTime: new Date(order.estimatedReadyTime),
      }));
    } catch (e) {
      console.error("Error loading orders from localStorage:", e);
      return [];
    }
  });

  const [currentOrder, setCurrentOrder] = useState<Order | null>(() => {
    const savedCurrent = localStorage.getItem("zappadu_current_order");
    if (!savedCurrent) return null;
    try {
      const order = JSON.parse(savedCurrent);
      return {
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        estimatedReadyTime: new Date(order.estimatedReadyTime),
      };
    } catch (e) {
      console.error("Error loading currentOrder from localStorage:", e);
      return null;
    }
  });

  // Fetch orders from backend API
  const refreshOrders = async () => {
    if (!user) return;
    try {
      const data = await api.getOrders();
      const formatted = data.map((o: any) => ({
        ...o,
        id: o.orderId, // Map orderId from MongoDB to local interface 'id'
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
        estimatedReadyTime: o.estimatedReadyTime ? new Date(o.estimatedReadyTime) : new Date(),
      }));
      setOrders(formatted);
      localStorage.setItem("zappadu_orders", JSON.stringify(formatted));
    } catch (err) {
      console.warn("Backend orders fetch failed, using local storage cache");
    }
  };

  useEffect(() => {
    if (user) {
      refreshOrders();
    }
  }, [user]);

  // Keep currentOrder synced with localStorage
  useEffect(() => {
    if (currentOrder) {
      localStorage.setItem("zappadu_current_order", JSON.stringify(currentOrder));
    } else {
      localStorage.removeItem("zappadu_current_order");
    }
  }, [currentOrder]);

  const placeOrder = async (
    items: CartItem[],
    paymentMethod: 'pay_now' | 'pay_later' | 'wallet' | 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'razorpay_googlepay',
    shopId: string,
    fee: number = 0,
    gst: number = 0,
    pickupTimeSlot: string = ""
  ): Promise<Order | null> => {
    try {
      const payload = {
        items: items.map(item => ({
          menuItem: {
            id: item.menuItem._id || item.menuItem.id,
            name: item.menuItem.name,
            price: item.menuItem.price
          },
          quantity: item.quantity
        })),
        paymentMethod,
        shopId,
        pickupTimeSlot
      };

      const data = await api.placeOrder(payload);
      
      const formattedOrder: Order = {
        ...data.order,
        id: data.order.orderId,
        createdAt: new Date(data.order.createdAt),
        updatedAt: new Date(data.order.updatedAt),
        estimatedReadyTime: new Date(data.order.estimatedReadyTime),
      };

      setOrders((prev) => [formattedOrder, ...prev]);
      setCurrentOrder(formattedOrder);
      toast.success(`Order #${formattedOrder.id} placed successfully!`);
      return formattedOrder;

    } catch (apiErr: any) {
      console.warn("Backend order placement failed, attempting local fallback:", apiErr);
      
      // Fallback: local checkout simulator
      const baseAmount = items.reduce(
        (total, item) => total + item.menuItem.price * item.quantity,
        0
      );
      const totalAmount = baseAmount + fee + gst;
      const maxPrepTime = Math.max(...items.map((item) => item.menuItem.preparationTime));
      const estimatedReadyTime = new Date(Date.now() + maxPrepTime * 60 * 1000);
      const shop = shops.find(s => s.id === shopId);

      const newOrder: Order = {
        id: `ORD${Date.now().toString().slice(-6)}`,
        items,
        totalAmount,
        status: "pending",
        paymentMethod,
        paymentStatus: paymentMethod === "pay_later" ? "pending" : "paid",
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedReadyTime,
        studentId: user?.id || "",
        studentName: user?.name || "Guest",
        shopId,
        shopName: shop?.name || "Unknown Shop",
        paymentFee: fee,
        paymentGst: gst,
        pickupTimeSlot,
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem("zappadu_orders", JSON.stringify(updatedOrders));
      setCurrentOrder(newOrder);
      toast.success(`[DEMO] Order #${newOrder.id} placed at ${shop?.name}!`);
      return newOrder;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // Find the MongoDB _id if possible
      const matchedOrder = orders.find(o => o.id === orderId || o._id === orderId);
      const targetId = matchedOrder?._id || orderId;

      await api.updateOrderStatus(targetId, status);
      
      const updatedOrders = orders.map((order) =>
        (order.id === orderId || order._id === orderId)
          ? { ...order, status, updatedAt: new Date() }
          : order
      );

      setOrders(updatedOrders);
      localStorage.setItem("zappadu_orders", JSON.stringify(updatedOrders));

      if (currentOrder?.id === orderId || currentOrder?._id === orderId) {
        setCurrentOrder((prev) => (prev ? { ...prev, status, updatedAt: new Date() } : null));
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

    } catch (err: any) {
      console.warn("Backend order status update failed, attempting local fallback:", err);
      
      const updatedOrders = orders.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date() }
          : order
      );

      setOrders(updatedOrders);
      localStorage.setItem("zappadu_orders", JSON.stringify(updatedOrders));

      if (currentOrder?.id === orderId) {
        setCurrentOrder((prev) => (prev ? { ...prev, status, updatedAt: new Date() } : null));
      }

      toast.info(`[DEMO] Status updated: ${status}`);
    }
  };

  const getOrdersByStudent = (studentId: string) =>
    orders.filter((order) => order.studentId === studentId);

  const getOrdersByShop = (shopId: string) =>
    orders.filter((order) => order.shopId === shopId);

  const getAllOrders = () => orders;

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        placeOrder,
        updateOrderStatus,
        getOrdersByStudent,
        getOrdersByShop,
        getAllOrders,
        refreshOrders
      }}
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
