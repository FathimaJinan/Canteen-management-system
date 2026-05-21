import React from "react";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";
import { Clock, CheckCircle, ChefHat, Package, XCircle, Loader2, ThumbsUp } from "lucide-react";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "default" | "lg";
}

const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground",
  },
  accepted: {
    label: "Accepted",
    icon: <ThumbsUp className="h-3 w-3" />,
    className: "bg-primary/10 text-primary",
  },
  preparing: {
    label: "Preparing",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-warning/10 text-warning",
  },
  ready: {
    label: "Ready",
    icon: <Package className="h-3 w-3" />,
    className: "bg-success/10 text-success",
  },
  collected: {
    label: "Collected",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-success text-success-foreground",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-destructive/10 text-destructive",
  },
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = "default" }) => {
  const config = statusConfig[status];
  return (
    <Badge className={`${config.className} gap-1 ${size === "lg" ? "px-4 py-2 text-sm" : ""}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default OrderStatusBadge;
