import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CartItemComponent from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { shops } from "@/data/shops";
import { ShoppingBag, ArrowRight, IndianRupee, CreditCard, Wallet, AlertCircle } from "lucide-react";

const Cart: React.FC = () => {
  const { items, currentShopId, getTotalAmount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'pay_now' | 'pay_later'>('pay_later');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const totalAmount = getTotalAmount();
  const shop = shops.find(s => s.id === currentShopId);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    setIsPlacingOrder(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    placeOrder(items, paymentMethod, currentShopId || "");
    clearCart();
    navigate("/orders");
    setIsPlacingOrder(false);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="h-24 w-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Browse a shop and add items to get started.</p>
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
          Your <span className="gradient-text">Cart</span>
        </h1>
        {shop && (
          <p className="text-muted-foreground mb-8">Ordering from <strong>{shop.name}</strong></p>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemComponent key={item.menuItem.id} item={item} />
            ))}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.menuItem.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.menuItem.name} × {item.quantity}</span>
                      <span>₹{item.menuItem.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="flex items-center text-primary"><IndianRupee className="h-4 w-4" />{totalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Payment Method</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'pay_now' | 'pay_later')} className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="pay_now" id="pay_now" />
                    <Label htmlFor="pay_now" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Pay Now (Online)</div>
                        <div className="text-xs text-muted-foreground">Complete payment online</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="pay_later" id="pay_later" />
                    <Label htmlFor="pay_later" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Pay at Counter</div>
                        <div className="text-xs text-muted-foreground">Pay when you collect</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {!isAuthenticated && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                <p>Please login to place your order</p>
              </div>
            )}

            <Button variant="hero" size="lg" className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
              {isPlacingOrder ? "Placing Order..." : isAuthenticated ? (<>Place Order <ArrowRight className="ml-2 h-4 w-4" /></>) : (<>Login to Order <ArrowRight className="ml-2 h-4 w-4" /></>)}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
