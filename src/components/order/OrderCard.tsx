import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Order } from "@/types";
import OrderStatusBadge from "./OrderStatusBadge";
import { IndianRupee, Clock, Calendar, Store } from "lucide-react";
import { format } from "date-fns";

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <Card className="overflow-hidden card-hover">
      <CardHeader className="border-b bg-muted/30 py-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-sm text-muted-foreground">Order</span>
            <span className="ml-2 font-bold text-lg">#{order.id}</span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Store className="h-3 w-3" />
          <span>{order.shopName}</span>
        </div>

        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.menuItem.id} className="flex justify-between text-sm">
              <span>{item.menuItem.name} × {item.quantity}</span>
              <span className="flex items-center text-muted-foreground">
                <IndianRupee className="h-3 w-3" />
                {item.menuItem.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t" />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="flex items-center text-primary">
            <IndianRupee className="h-4 w-4" />
            {order.totalAmount}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
          </div>
          {(order.status === "preparing" || order.status === "accepted") && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Ready by {format(new Date(order.estimatedReadyTime), "hh:mm a")}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-1 rounded ${order.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {order.paymentStatus === 'paid' ? '✓ Paid Online' : '⏳ Pay at Counter'}
          </span>
        </div>

        {order.status === "ready" && (
          <div className="p-2 bg-success/10 border border-success/30 rounded-lg text-sm text-center font-medium text-success animate-pulse-slow">
            🔔 Your order is ready for pickup!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
