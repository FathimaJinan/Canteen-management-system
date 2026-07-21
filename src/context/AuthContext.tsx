import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { toast } from "sonner";
import { api } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, sinNumber: string) => Promise<boolean>;
  logout: () => void;
  isShopOwner: boolean;
  isAdmin: boolean;
  topUpWallet: (amount: number, method: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'razorpay_googlepay') => Promise<boolean>;
  deductWallet: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERS: (User & { password: string })[] = [
  {
    id: "0",
    name: "Super Admin",
    email: "admin@college.edu",
    password: "admin123",
    role: "admin",
  },
  {
    id: "1",
    name: "Demo Student",
    email: "student@college.edu",
    password: "student123",
    role: "student",
    sinNumber: "SIN001",
    walletBalance: 500,
  },
  {
    id: "2",
    name: "fathima jinan",
    email: "jinan28.8.2005@gmail.com",
    password: "123456",
    role: "student",
    sinNumber: "e23ai036",
    walletBalance: 1200,
  },
  {
    id: "3",
    name: "Annapurna Owner",
    email: "annapurna@zappadu.com",
    password: "shop123",
    role: "shop_owner",
    shopId: "shop1",
  },
  {
    id: "4",
    name: "Spice Junction Owner",
    email: "spicejunction@zappadu.com",
    password: "shop123",
    role: "shop_owner",
    shopId: "shop2",
  },
  {
    id: "5",
    name: "Quick Bites Owner",
    email: "quickbites@zappadu.com",
    password: "shop123",
    role: "shop_owner",
    shopId: "shop3",
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("zappadu_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Ensure users database exists in localStorage for local fallback
  useEffect(() => {
    const existing = localStorage.getItem("zappadu_users");
    if (!existing) {
      localStorage.setItem("zappadu_users", JSON.stringify(DEFAULT_USERS));
    } else {
      try {
        const parsed = JSON.parse(existing);
        // If admin@college.edu is not in the cached local database, re-seed defaults
        if (!parsed.some((u: any) => u.email === "admin@college.edu")) {
          localStorage.setItem("zappadu_users", JSON.stringify(DEFAULT_USERS));
        }
      } catch (e) {
        localStorage.setItem("zappadu_users", JSON.stringify(DEFAULT_USERS));
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem("zappadu_token", data.token);

      const loggedUser: User = {
        id: data.user.id || data.user._id,
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        sinNumber: data.user.sinNumber,
        shopId: data.user.shopId,
        walletBalance: data.user.walletBalance,
      };

      setUser(loggedUser);
      localStorage.setItem("zappadu_user", JSON.stringify(loggedUser));
      toast.success(`Welcome back, ${loggedUser.name}!`);
      return true;
    } catch (apiErr: any) {
      console.warn("Backend login failed, using local storage fallback:", apiErr);
      
      const allUsersStr = localStorage.getItem("zappadu_users");
      const allUsers: (User & { password: string })[] = allUsersStr 
        ? JSON.parse(allUsersStr) 
        : DEFAULT_USERS;

      const foundUser = allUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("zappadu_user", JSON.stringify(userWithoutPassword));
        toast.success(`[DEMO] Welcome back, ${foundUser.name}!`);
        return true;
      }
      toast.error(apiErr.message || "Invalid email or password");
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    sinNumber: string
  ): Promise<boolean> => {
    try {
      const data = await api.register(name, email, password, sinNumber);
      localStorage.setItem("zappadu_token", data.token);

      const loggedUser: User = {
        id: data.user.id || data.user._id,
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        sinNumber: data.user.sinNumber,
        walletBalance: data.user.walletBalance,
      };

      setUser(loggedUser);
      localStorage.setItem("zappadu_user", JSON.stringify(loggedUser));
      toast.success("Registration successful! Welcome to Zappadu!");
      return true;
    } catch (apiErr: any) {
      console.warn("Backend registration failed, using local fallback:", apiErr);
      
      const allUsersStr = localStorage.getItem("zappadu_users");
      const allUsers: (User & { password: string })[] = allUsersStr 
        ? JSON.parse(allUsersStr) 
        : [...DEFAULT_USERS];

      const existingUser = allUsers.find((u) => u.email === email);
      if (existingUser) {
        toast.error("Email already registered");
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: "student",
        sinNumber,
        walletBalance: 0,
      };

      const updatedUsers = [...allUsers, { ...newUser, password }];
      localStorage.setItem("zappadu_users", JSON.stringify(updatedUsers));
      setUser(newUser);
      localStorage.setItem("zappadu_user", JSON.stringify(newUser));
      toast.success("Registration successful! (Demo Mode)");
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("zappadu_user");
    localStorage.removeItem("zappadu_token");
    toast.info("You have been logged out");
  };

  const topUpWallet = async (amount: number, method: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'razorpay_googlepay'): Promise<boolean> => {
    if (!user) return false;

    try {
      const data = await api.topUpWallet(amount);
      const updatedUser = { ...user, walletBalance: data.walletBalance };
      setUser(updatedUser);
      localStorage.setItem("zappadu_user", JSON.stringify(updatedUser));
      toast.success(`Successfully topped up ₹${amount} using ${method.replace('razorpay_', '').toUpperCase()}!`);
      return true;
    } catch (apiErr) {
      console.warn("Backend wallet topup failed, using local fallback:", apiErr);

      const currentBalance = user.walletBalance || 0;
      const newBalance = currentBalance + amount;
      const updatedUser = { ...user, walletBalance: newBalance };

      setUser(updatedUser);
      localStorage.setItem("zappadu_user", JSON.stringify(updatedUser));

      const allUsersStr = localStorage.getItem("zappadu_users");
      if (allUsersStr) {
        const allUsers = JSON.parse(allUsersStr);
        const updatedUsers = allUsers.map((u: any) => 
          u.id === user.id ? { ...u, walletBalance: newBalance } : u
        );
        localStorage.setItem("zappadu_users", JSON.stringify(updatedUsers));
      }

      toast.success(`[DEMO] Successfully topped up ₹${amount}!`);
      return true;
    }
  };

  const deductWallet = (amount: number): boolean => {
    if (!user) return false;
    const currentBalance = user.walletBalance || 0;
    if (currentBalance < amount) {
      toast.error("Insufficient wallet balance. Please top up.");
      return false;
    }
    const newBalance = currentBalance - amount;
    const updatedUser = { ...user, walletBalance: newBalance };

    setUser(updatedUser);
    localStorage.setItem("zappadu_user", JSON.stringify(updatedUser));

    const allUsersStr = localStorage.getItem("zappadu_users");
    if (allUsersStr) {
      const allUsers = JSON.parse(allUsersStr);
      const updatedUsers = allUsers.map((u: any) => 
        u.id === user.id ? { ...u, walletBalance: newBalance } : u
      );
      localStorage.setItem("zappadu_users", JSON.stringify(updatedUsers));
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isShopOwner: user?.role === "shop_owner",
        isAdmin: user?.role === "admin",
        topUpWallet,
        deductWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
