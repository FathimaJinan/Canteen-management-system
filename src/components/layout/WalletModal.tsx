import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { PaymentGatewayModal } from "../ui/PaymentGatewayModal";
import {
  IndianRupee,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  Clock,
  Sparkles,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletTransaction {
  id: string;
  userId: string;
  type: 'topup' | 'payment';
  amount: number;
  method: string;
  createdAt: string;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { user, topUpWallet } = useAuth();
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'razorpay_googlepay'>('razorpay_upi');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  // Load transactions
  useEffect(() => {
    if (isOpen && user) {
      const txs = localStorage.getItem("zappadu_wallet_transactions");
      if (txs) {
        try {
          const parsed = JSON.parse(txs);
          const filtered = parsed.filter((t: WalletTransaction) => t.userId === user.id);
          setTransactions(filtered);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen, user]);

  if (!user) return null;

  const currentBalance = user.walletBalance || 0;

  const handleQuickAdd = (amount: number) => {
    setTopUpAmount(amount.toString());
  };

  const handleStartTopUp = () => {
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount to top up.");
      return;
    }
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = async (fee: number, gst: number) => {
    const amt = parseFloat(topUpAmount);
    await topUpWallet(amt, selectedMethod);
    setTopUpAmount("");
    setShowPaymentGateway(false);
    
    // Reload transactions
    const txs = localStorage.getItem("zappadu_wallet_transactions");
    if (txs) {
      const parsed = JSON.parse(txs);
      setTransactions(parsed.filter((t: WalletTransaction) => t.userId === user.id));
    }
  };

  const handlePaymentFailure = (reason: string) => {
    toast.error(`Wallet top-up failed: ${reason}`);
    setShowPaymentGateway(false);
  };

  const getMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      wallet: "Canteen Wallet Ledger",
      razorpay_upi: "UPI (Razorpay)",
      razorpay_card: "Card (Razorpay)",
      razorpay_netbanking: "Net Banking (Razorpay)",
      razorpay_googlepay: "Google Pay (Razorpay)",
    };
    return methods[method] || method;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[480px] p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <span>Canteen Wallet</span>
              <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
            </DialogTitle>
            <DialogDescription>
              Manage your prepaid balance for instant under-1-second order confirmation.
            </DialogDescription>
          </DialogHeader>

          {/* Current balance card */}
          <div className="bg-gradient-to-br from-primary to-orange-600 text-white rounded-2xl p-6 mt-4 shadow-lg flex flex-col justify-between h-40">
            <div>
              <span className="text-xs text-orange-100 font-medium tracking-wide uppercase">Available Balance</span>
              <h2 className="text-4xl font-extrabold flex items-center mt-1">
                <IndianRupee className="h-8 w-8 stroke-[2.5]" />
                <span>{currentBalance.toFixed(2)}</span>
              </h2>
            </div>
            <div className="flex justify-between items-center text-xs text-orange-100 border-t border-orange-400/30 pt-3">
              <span>Card Holder: {user.name}</span>
              <span>SIN: {user.sinNumber || "N/A"}</span>
            </div>
          </div>

          {/* Wallet features */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-muted/50 p-2.5 rounded-lg border flex flex-col items-center">
              <span className="text-[10px] font-bold text-emerald-600 block mb-1">0% FEES</span>
              <p className="text-[10px] text-muted-foreground leading-tight">No payment gateway fee</p>
            </div>
            <div className="bg-muted/50 p-2.5 rounded-lg border flex flex-col items-center">
              <span className="text-[10px] font-bold text-amber-600 block mb-1">INSTANT</span>
              <p className="text-[10px] text-muted-foreground leading-tight">Order under 1 second</p>
            </div>
            <div className="bg-muted/50 p-2.5 rounded-lg border flex flex-col items-center">
              <span className="text-[10px] font-bold text-indigo-600 block mb-1">SECURE</span>
              <p className="text-[10px] text-muted-foreground leading-tight">Protected internal ledger</p>
            </div>
          </div>

          {/* Top up section */}
          <div className="space-y-3 mt-6 border-t pt-5">
            <h3 className="font-semibold text-sm">Add Funds via Razorpay</h3>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Enter amount"
                  className="pl-9"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleStartTopUp} className="gap-1 shadow-sm">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[100, 200, 500, 1000].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  className="text-xs py-1 h-7 px-2.5"
                  onClick={() => handleQuickAdd(amt)}
                >
                  +₹{amt}
                </Button>
              ))}
            </div>

            {/* Select Gateway Method */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div
                onClick={() => setSelectedMethod('razorpay_upi')}
                className={`p-2 border rounded-lg cursor-pointer text-center text-xs flex flex-col items-center justify-center transition-all ${
                  selectedMethod === 'razorpay_upi'
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'hover:bg-muted/50'
                }`}
              >
                <span>UPI (Razorpay)</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">0% fee</span>
              </div>
              <div
                onClick={() => setSelectedMethod('razorpay_card')}
                className={`p-2 border rounded-lg cursor-pointer text-center text-xs flex flex-col items-center justify-center transition-all ${
                  selectedMethod === 'razorpay_card'
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'hover:bg-muted/50'
                }`}
              >
                <span>Debit/Credit Card</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">2% + GST fee</span>
              </div>
            </div>
          </div>

          {/* Transactions section */}
          <div className="mt-6 border-t pt-5 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Wallet Ledger History</span>
            </h3>

            {transactions.length === 0 ? (
              <div className="text-center py-6 border rounded-lg border-dashed text-xs text-muted-foreground">
                No recent transactions found on this device.
              </div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-2.5 bg-muted/30 rounded-lg border text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${
                        tx.type === 'topup' ? 'bg-success/10 text-success' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {tx.type === 'topup' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <div className="font-medium">{tx.type === 'topup' ? 'Wallet Top-Up' : 'Canteen Payment'}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {getMethodLabel(tx.method)} • {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.type === 'topup' ? 'text-success' : 'text-foreground'}`}>
                      {tx.type === 'topup' ? '+' : '-'}₹{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Embedded top-up payment gateway modal */}
      {showPaymentGateway && (
        <PaymentGatewayModal
          isOpen={showPaymentGateway}
          onClose={() => setShowPaymentGateway(false)}
          amount={parseFloat(topUpAmount) || 0}
          paymentMethod={selectedMethod}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </>
  );
};
