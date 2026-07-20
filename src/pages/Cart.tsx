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
import { PaymentGatewayModal } from "@/components/ui/PaymentGatewayModal";
import { WalletModal } from "@/components/layout/WalletModal";
import {
  ShoppingBag,
  ArrowRight,
  IndianRupee,
  CreditCard,
  Wallet,
  AlertCircle,
  Smartphone,
  Building,
  Coins,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const Cart: React.FC = () => {
  const { items, currentShopId, getTotalAmount, clearCart } = useCart();
  const { user, isAuthenticated, deductWallet } = useAuth();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'razorpay_googlepay' | 'pay_later'>('wallet');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const subtotal = getTotalAmount();
  const shop = shops.find(s => s.id === currentShopId);

  // Dynamic fee calculation based on payment report details
  let fee = 0;
  if (paymentMethod === 'razorpay_card' || paymentMethod === 'razorpay_netbanking') {
    fee = Math.round((subtotal * 0.02) * 100) / 100; // 2%
  }
  const gst = Math.round((fee * 0.18) * 100) / 100; // 18% GST on fee
  const grandTotal = Math.round((subtotal + fee + gst) * 100) / 100;

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (paymentMethod === 'wallet') {
      const balance = user?.walletBalance || 0;
      if (balance < grandTotal) {
        toast.error("Insufficient wallet balance. Please top up or select another method.");
        return;
      }
    }

    if (paymentMethod === 'pay_later') {
      setIsPlacingOrder(true);
      placeOrder(items, 'pay_later', currentShopId || "", 0, 0);
      clearCart();
      toast.success("Order placed! Pay at the counter when collecting.");
      navigate("/orders");
      setIsPlacingOrder(false);
    } else {
      setShowPaymentGateway(true);
    }
  };

  const handlePaymentSuccess = (paidFee: number, paidGst: number) => {
    setIsPlacingOrder(true);
    setShowPaymentGateway(false);
    
    // If wallet was used, deduct balance
    if (paymentMethod === 'wallet') {
      const success = deductWallet(grandTotal);
      if (!success) {
        setIsPlacingOrder(false);
        return;
      }
    }

    placeOrder(items, paymentMethod, currentShopId || "", paidFee, paidGst);
    clearCart();
    navigate("/orders");
    setIsPlacingOrder(false);
  };

  const handlePaymentFailure = (reason: string) => {
    toast.error(`Order payment failed: ${reason}`);
    setShowPaymentGateway(false);
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

  const walletBalance = user?.walletBalance || 0;
  const isWalletInsufficient = paymentMethod === 'wallet' && walletBalance < grandTotal;

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
                <div className="space-y-2 border-b pb-3">
                  {items.map((item) => (
                    <div key={item.menuItem.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.menuItem.name} × {item.quantity}</span>
                      <span>₹{item.menuItem.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-1.5 text-sm border-b pb-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {fee > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Gateway Fee (2%)</span>
                      <span>₹{fee}</span>
                    </div>
                  )}
                  {gst > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST on Fee (18%)</span>
                      <span>₹{gst}</span>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="flex items-center text-primary"><IndianRupee className="h-4 w-4" />{grandTotal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center justify-between">
                <span>Select Payment Method</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> SECURE
                </span>
              </CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="space-y-3">
                  
                  {/* Canteen Wallet */}
                  <div className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-all ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="wallet" id="wallet" className="mt-1" />
                    <Label htmlFor="wallet" className="flex items-start gap-2 cursor-pointer flex-1">
                      <Wallet className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>Canteen Wallet</span>
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-1.5 py-0.5 rounded text-[9px] font-bold">0% FEES</span>
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          Instant checkout under 1 second.
                        </div>
                        {isAuthenticated && (
                          <div className="text-xs font-semibold flex items-center gap-2 mt-1">
                            <span className={walletBalance < grandTotal ? "text-destructive" : "text-emerald-600"}>
                              Balance: ₹{walletBalance.toFixed(2)}
                            </span>
                            {walletBalance < grandTotal && (
                              <button
                                onClick={(e) => { e.preventDefault(); setIsWalletOpen(true); }}
                                className="text-primary hover:underline text-[11px] flex items-center gap-0.5"
                              >
                                <Sparkles className="h-3 w-3" /> Top Up Wallet
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>

                  {/* UPI */}
                  <div className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-all ${paymentMethod === 'razorpay_upi' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="razorpay_upi" id="razorpay_upi" className="mt-1" />
                    <Label htmlFor="razorpay_upi" className="flex items-start gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>UPI (Razorpay)</span>
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-1.5 py-0.5 rounded text-[9px] font-bold">0% FEES</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Pay via PhonePe, GPay, Paytm or UPI ID</div>
                      </div>
                    </Label>
                  </div>

                  {/* Card */}
                  <div className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-all ${paymentMethod === 'razorpay_card' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="razorpay_card" id="razorpay_card" className="mt-1" />
                    <Label htmlFor="razorpay_card" className="flex items-start gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold">Debit / Credit Card</div>
                        <div className="text-xs text-muted-foreground">Visa, MasterCard, RuPay (2% fee + GST)</div>
                      </div>
                    </Label>
                  </div>

                  {/* Net Banking */}
                  <div className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-all ${paymentMethod === 'razorpay_netbanking' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="razorpay_netbanking" id="razorpay_netbanking" className="mt-1" />
                    <Label htmlFor="razorpay_netbanking" className="flex items-start gap-2 cursor-pointer flex-1">
                      <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold">Net Banking</div>
                        <div className="text-xs text-muted-foreground">All major Indian banks supported (2% fee + GST)</div>
                      </div>
                    </Label>
                  </div>

                  {/* Google Pay */}
                  <div className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-all opacity-60 ${paymentMethod === 'razorpay_googlepay' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="razorpay_googlepay" id="razorpay_googlepay" className="mt-1" />
                    <Label htmlFor="razorpay_googlepay" className="flex items-start gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>Google Pay / Apple Pay</span>
                          <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[9px] font-bold">FUTURE</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Future gateway support (TBD)</div>
                      </div>
                    </Label>
                  </div>

                  {/* Pay at Counter */}
                  <div className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-all ${paymentMethod === 'pay_later' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="pay_later" id="pay_later" className="mt-1" />
                    <Label htmlFor="pay_later" className="flex items-start gap-2 cursor-pointer flex-1">
                      <Coins className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold">Pay at Counter</div>
                        <div className="text-xs text-muted-foreground">Pay cash/card directly when picking up order</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Error alerts */}
            {isWalletInsufficient && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <strong>Insufficient wallet balance.</strong> Please top up your wallet balance or choose another online gateway option.
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                <p>Please login to place your order</p>
              </div>
            )}

            <Button
              variant="hero"
              size="lg"
              className="w-full font-semibold shadow-md btn-glow"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || isWalletInsufficient}
            >
              {isPlacingOrder ? "Placing Order..." : isAuthenticated ? (<>Place Order <ArrowRight className="ml-2 h-4 w-4" /></>) : (<>Login to Order <ArrowRight className="ml-2 h-4 w-4" /></>)}
            </Button>
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Modal */}
      {showPaymentGateway && (
        <PaymentGatewayModal
          isOpen={showPaymentGateway}
          onClose={() => setShowPaymentGateway(false)}
          amount={subtotal}
          paymentMethod={paymentMethod}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}

      {/* Wallet dialog */}
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </Layout>
  );
};

export default Cart;
