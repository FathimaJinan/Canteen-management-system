import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, User, LogOut, Store, Menu, X, GraduationCap, ClipboardList, Wallet } from "lucide-react";
import { WalletModal } from "./WalletModal";

const Header: React.FC = () => {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout, isShopOwner, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const totalItems = getTotalItems();

  const isActive = (path: string) => location.pathname === path;

  const studentLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Shops" },
    { to: "/orders", label: "My Orders" },
  ];

  const shopLinks = [
    { to: "/shop-dashboard", label: "Dashboard" },
  ];

  const adminLinks = [
    { to: "/admin", label: "Admin Dashboard" },
  ];

  const navLinks = isAdmin ? adminLinks : (isShopOwner ? shopLinks : studentLinks);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to={isAdmin ? "/admin" : (isShopOwner ? "/shop-dashboard" : "/")} className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="text-xl font-bold text-primary-foreground">Z</span>
            </div>
            <span className="text-xl font-bold gradient-text">Zappadu</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant={isActive(link.to) ? "secondary" : "ghost"} className={isActive(link.to) ? "font-semibold" : ""}>
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated && !isShopOwner && !isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWalletOpen(true)}
                className="hidden sm:flex items-center gap-1.5 border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-500 font-semibold"
              >
                <Wallet className="h-4 w-4" />
                <span>₹{(user?.walletBalance || 0).toFixed(2)}</span>
              </Button>
            )}

            {!isShopOwner && !isAdmin && (
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {isAdmin ? <User className="h-4 w-4" /> : (isShopOwner ? <Store className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />)}
                  {user?.name?.split(" ")[0]}
                </div>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 animate-slide-up">
            <nav className="flex flex-col gap-2">
              {isAuthenticated && !isShopOwner && !isAdmin && (
                <div className="px-4 py-2 border-b mb-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Canteen Wallet Balance</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setWalletOpen(true); setMobileMenuOpen(false); }}
                    className="flex items-center gap-1.5 border-amber-500/30 bg-amber-500/5 text-amber-600 font-semibold"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>₹{(user?.walletBalance || 0).toFixed(2)}</span>
                  </Button>
                </div>
              )}
              
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive(link.to) ? "secondary" : "ghost"} className="w-full justify-start">
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="border-t pt-2 mt-2">
                {isAuthenticated ? (
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout ({user?.name})
                  </Button>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Login / Register
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      
      {/* Wallet dialog */}
      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </header>
  );
};

export default Header;
