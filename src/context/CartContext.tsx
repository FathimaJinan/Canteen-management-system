import React, { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, MenuItem } from "@/types";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  currentShopId: string | null;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);

  const addToCart = (menuItem: MenuItem) => {
    if (currentShopId && currentShopId !== menuItem.shopId) {
      toast.error("You can only order from one shop at a time. Clear your cart to switch shops.");
      return;
    }
    setCurrentShopId(menuItem.shopId);
    setItems((prev) => {
      const existingItem = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existingItem) {
        toast.success(`Added another ${menuItem.name} to cart`);
        return prev.map((item) =>
          item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`${menuItem.name} added to cart`);
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.menuItem.id !== itemId);
      if (newItems.length === 0) setCurrentShopId(null);
      return newItems;
    });
    toast.info("Item removed from cart");
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) { removeFromCart(itemId); return; }
    setItems((prev) => prev.map((item) => item.menuItem.id === itemId ? { ...item, quantity } : item));
  };

  const clearCart = () => { setItems([]); setCurrentShopId(null); };

  const getTotalItems = () => items.reduce((t, i) => t + i.quantity, 0);
  const getTotalAmount = () => items.reduce((t, i) => t + i.menuItem.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, currentShopId, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
