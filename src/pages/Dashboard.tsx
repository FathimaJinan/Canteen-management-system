import React from "react";
import { Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { shops } from "@/data/shops";
import { Store, Clock, ArrowRight } from "lucide-react";

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== "student") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Hey, <span className="gradient-text">{user.name?.split(" ")[0]}</span>! 👋
          </h1>
          <p className="text-muted-foreground">
            Choose a canteen shop to start ordering
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          Canteen Shops
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Link key={shop.id} to={`/shop/${shop.id}`}>
              <Card className="overflow-hidden card-hover group cursor-pointer h-full">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <Badge
                    className={`absolute top-3 right-3 ${
                      shop.isOpen
                        ? "bg-success text-success-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {shop.isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                    {shop.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {shop.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>5-15 min prep</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary">
                      View Menu
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
