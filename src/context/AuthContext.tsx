import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, sinNumber: string) => Promise<boolean>;
  logout: () => void;
  isShopOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    name: "Demo Student",
    email: "student@college.edu",
    password: "student123",
    role: "student",
    sinNumber: "SIN001",
  },
  {
    id: "2",
    name: "Annapurna Owner",
    email: "annapurna@zappadu.com",
    password: "shop123",
    role: "shop_owner",
    shopId: "shop1",
  },
  {
    id: "3",
    name: "Spice Junction Owner",
    email: "spicejunction@zappadu.com",
    password: "shop123",
    role: "shop_owner",
    shopId: "shop2",
  },
  {
    id: "4",
    name: "Quick Bites Owner",
    email: "quickbites@zappadu.com",
    password: "shop123",
    role: "shop_owner",
    shopId: "shop3",
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      toast.success(`Welcome back, ${foundUser.name}!`);
      return true;
    }
    toast.error("Invalid email or password");
    return false;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    sinNumber: string
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const existingUser = mockUsers.find((u) => u.email === email);
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
    };
    mockUsers.push({ ...newUser, password });
    setUser(newUser);
    toast.success("Registration successful! Welcome to Zappadu!");
    return true;
  };

  const logout = () => {
    setUser(null);
    toast.info("You have been logged out");
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
