import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, IndianRupee, ShieldCheck } from "lucide-react";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentMethod: 'wallet' | 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'razorpay_googlepay';
  onSuccess: (fee: number, gst: number) => void;
  onFailure: (reason: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  amount,
  paymentMethod,
  onSuccess,
  onFailure,
}) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success' | 'failure'>('details');
  const [progressText, setProgressText] = useState('');
  const [errorReason, setErrorReason] = useState('');

  // Fee calculation matching report
  // Wallet: 0%, UPI: 0%, Card: 2% + GST, Net Banking: 2% + GST, Google Pay: 0% / Future (TBD)
  let feePercentage = 0;
  if (paymentMethod === 'razorpay_card' || paymentMethod === 'razorpay_netbanking') {
    feePercentage = 0.02; // 2%
  }

  const baseAmount = amount;
  const gatewayFee = Math.round((baseAmount * feePercentage) * 100) / 100;
  const gstAmount = Math.round((gatewayFee * 0.18) * 100) / 100; // 18% GST on fee
  const totalAmount = Math.round((baseAmount + gatewayFee + gstAmount) * 100) / 100;

  const paymentNames: Record<string, string> = {
    wallet: "Canteen Wallet Ledger",
    razorpay_upi: "Razorpay UPI Gateway",
    razorpay_card: "Razorpay Card Checkout",
    razorpay_netbanking: "Razorpay Net Banking",
    razorpay_googlepay: "Razorpay Apple/Google Pay",
  };

  const handlePay = () => {
    setStep('processing');
  };

  const isInstant = paymentMethod === 'wallet';

  // Simulate payment processing flow
  useEffect(() => {
    if (step !== 'processing') return;

    let isMounted = true;

    const runSimulation = async () => {
      if (isInstant) {
        // Canteen Wallet instant payment simulation (< 1 second)
        setProgressText("Connecting to internal ledger...");
        await new Promise((r) => setTimeout(r, 300));
        if (!isMounted) return;

        setProgressText("Verifying balance and locking funds...");
        await new Promise((r) => setTimeout(r, 300));
        if (!isMounted) return;

        setProgressText("Ledger update successful!");
        await new Promise((r) => setTimeout(r, 200));
        if (!isMounted) return;

        setStep('success');
      } else {
        // Razorpay external payment gateway simulation (takes ~5-6 seconds)
        setProgressText("Initializing Razorpay Secure Checkout...");
        await new Promise((r) => setTimeout(r, 1200));
        if (!isMounted) return;

        setProgressText("Contacting primary payment gateway API...");
        await new Promise((r) => setTimeout(r, 1200));
        if (!isMounted) return;

        setProgressText("Redirecting to safe 3D Secure banking page...");
        await new Promise((r) => setTimeout(r, 1200));
        if (!isMounted) return;

        setProgressText("Awaiting settlement and capturing payment response...");
        await new Promise((r) => setTimeout(r, 1200));
        if (!isMounted) return;

        setProgressText("Payment captured successfully!");
        await new Promise((r) => setTimeout(r, 600));
        if (!isMounted) return;

        setStep('success');
      }
    };

    runSimulation();

    return () => {
      isMounted = false;
    };
  }, [step, paymentMethod, isInstant]);

  // Handle finalize success
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        onSuccess(gatewayFee, gstAmount);
        onClose();
        // Reset state
        setStep('details');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, onSuccess, onClose, gatewayFee, gstAmount]);

  const handleSimulateFailure = () => {
    setErrorReason("User cancelled the payment verification code request");
    setStep('failure');
  };

  const handleRetry = () => {
    setStep('details');
  };

  const handleCloseFailure = () => {
    onFailure(errorReason || "Payment cancelled");
    onClose();
    setStep('details');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      if (step !== 'processing' && step !== 'success') {
        onClose();
        setStep('details');
      }
    }}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none rounded-xl shadow-2xl">
        {/* Razorpay-style header */}
        <div className="bg-[#0f172a] text-white p-6 flex flex-col gap-1 relative">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Merchant</span>
              <DialogTitle className="text-lg font-bold text-white mt-0.5">Zappadu Canteen</DialogTitle>
            </div>
            <div className="bg-[#1e293b] px-3 py-1 rounded border border-slate-700 flex items-center gap-1.5">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Test Mode</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-slate-800 pt-4">
            <span className="text-xs text-slate-400">{paymentNames[paymentMethod] || "Payment Gateway"}</span>
            <div className="flex items-center text-xl font-bold text-white">
              <IndianRupee className="h-4 w-4" />
              <span>{totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card">
          {step === 'details' && (
            <div className="space-y-6">
              <DialogDescription className="text-sm text-muted-foreground">
                You are about to authorize this secure transaction. Here is the fee breakdown for your selected option:
              </DialogDescription>

              <div className="space-y-2 border-y py-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Order Subtotal</span>
                  <span className="flex items-center text-foreground"><IndianRupee className="h-3 w-3" />{baseAmount}</span>
                </div>
                {gatewayFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Razorpay Fee ({feePercentage * 100}%)</span>
                    <span className="flex items-center text-foreground"><IndianRupee className="h-3 w-3" />{gatewayFee}</span>
                  </div>
                )}
                {gstAmount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST on Fee (18%)</span>
                    <span className="flex items-center text-foreground"><IndianRupee className="h-3 w-3" />{gstAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2 mt-2 text-base text-primary">
                  <span>Grand Total</span>
                  <span className="flex items-center"><IndianRupee className="h-4 w-4" />{totalAmount}</span>
                </div>
              </div>

              {/* Settlement text */}
              <div className="text-[11px] text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-dashed">
                <strong>Settlement Terms:</strong> {paymentMethod === 'wallet' ? "Instant - Internal ledger" : (paymentMethod === 'razorpay_upi' || paymentMethod === 'razorpay_googlepay' ? "T+1 banking day" : "T+2 banking days")} settlement.
              </div>

              <div className="flex flex-col gap-2">
                <Button className="w-full font-semibold shadow-md btn-glow" onClick={handlePay}>
                  Authorize Payment
                </Button>
                {!isInstant && (
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleSimulateFailure}>
                    Simulate Failure
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base">Processing Transaction</h3>
                <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded max-w-[320px] mx-auto animate-pulse">
                  {progressText}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Powered by Razorpay secure systems
              </p>
              {paymentMethod !== 'wallet' && (
                <Button variant="outline" size="sm" className="text-xs mt-4" onClick={handleSimulateFailure}>
                  Cancel / Fail Payment
                </Button>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-success">Payment Successful</h3>
                <p className="text-xs text-muted-foreground">Redirecting to order dashboard...</p>
              </div>
            </div>
          )}

          {step === 'failure' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-14 w-14 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                <XCircle className="h-9 w-9" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-destructive">Payment Failed</h3>
                <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">{errorReason}</p>
              </div>
              <div className="flex gap-2 w-full mt-4">
                <Button variant="outline" className="flex-1 text-xs" onClick={handleCloseFailure}>
                  Cancel
                </Button>
                <Button className="flex-1 text-xs" onClick={handleRetry}>
                  Retry Payment
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
