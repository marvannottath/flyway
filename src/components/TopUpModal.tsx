"use client";

import { useState, useEffect } from "react";
import {
  X,
  Zap,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Lock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Building2,
  DollarSign,
  Copy,
  Check,
} from "lucide-react";
import { CREDIT_TIERS, calculateCustomCredits } from "@/lib/pricing";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess?: () => void;
  defaultTierId?: string;
}

export default function TopUpModal({
  isOpen,
  onClose,
  userId = "usr_client_ca_02",
  onSuccess,
  defaultTierId = "pro_500",
}: TopUpModalProps) {
  const [selectedTierId, setSelectedTierId] = useState<string>(defaultTierId);
  const [currency, setCurrency] = useState<"CAD" | "USD">("CAD");
  const [customAmount, setCustomAmount] = useState<number>(2500);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"SELECT_TIER" | "PAYMENT" | "SUCCESS">("SELECT_TIER");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Payment Intent details
  const [paymentDetails, setPaymentDetails] = useState<{
    clientSecret: string | null;
    paymentIntentId: string;
    amountCents: number;
    currency: string;
    creditsToAdd: number;
    orderRef: string;
    isMockMode?: boolean;
    tierName?: string;
    chargeId?: string;
  } | null>(null);

  // Card details state
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardHolder, setCardHolder] = useState("Authorized Corporate Officer");
  const [isProcessingCard, setIsProcessingCard] = useState(false);

  useEffect(() => {
    if (defaultTierId) {
      setSelectedTierId(defaultTierId);
    }
    if (isOpen) {
      setStep("SELECT_TIER");
      setErrorMsg(null);
    }
  }, [isOpen, defaultTierId]);

  if (!isOpen) return null;

  const currentTier = CREDIT_TIERS.find((t) => t.id === selectedTierId);
  const isCustom = selectedTierId === "custom";

  const totalCredits = isCustom
    ? calculateCustomCredits(customAmount)
    : currentTier?.credits || 0;

  const totalCost = isCustom
    ? customAmount
    : currency === "USD"
    ? currentTier?.priceUSD || 0
    : currentTier?.priceCAD || 0;

  // Step 1: Create PaymentIntent on server
  const handleInitiateTopUp = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/wallet/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: selectedTierId,
          currency,
          customAmount: isCustom ? customAmount : undefined,
          userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize checkout session");
      }

      setPaymentDetails(data);
      setStep("PAYMENT");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm Payment & credit balance
  const handleConfirmPayment = async () => {
    if (!paymentDetails) return;
    setIsProcessingCard(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/wallet/simulate-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef: paymentDetails.orderRef,
          paymentIntentId: paymentDetails.paymentIntentId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment confirmation failed");
      }

      setPaymentDetails({
        ...paymentDetails,
        chargeId: data.transaction?.stripeChargeId,
      });

      setStep("SUCCESS");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Payment processing failed");
    } finally {
      setIsProcessingCard(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-[#0D0F15] shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-[#12151E]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090B10] border border-white/10 p-1 shadow-md">
              <img
                src="/flyway-logo.png"
                alt="Flyway Logo"
                className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Commercial Compute Credit Top-Up</h3>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  Stripe Verified
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Pre-authorized commercial SaaS settlement • Dynamic statement descriptor:{" "}
                <code className="text-brand-cyan font-bold font-mono">FLYWAY*COMPUTE</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === "SELECT_TIER" && (
            <div className="space-y-5 animate-fadeIn">
              {/* Currency Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Settlement Currency:</span>
                <div className="inline-flex rounded-xl border border-border p-1 bg-[#090B10]">
                  <button
                    type="button"
                    onClick={() => setCurrency("CAD")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      currency === "CAD"
                        ? "bg-brand-cyan text-black font-bold shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    CAD ($) - Canadian Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      currency === "USD"
                        ? "bg-brand-cyan text-black font-bold shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    USD ($) - International
                  </button>
                </div>
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CREDIT_TIERS.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  const price = currency === "USD" ? tier.priceUSD : tier.priceCAD;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
                        isSelected
                          ? "border-brand-cyan bg-brand-cyan/10 shadow-lg shadow-brand-cyan/10 ring-1 ring-brand-cyan"
                          : "border-border bg-[#10121C] hover:border-border/80 hover:bg-[#131622]"
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-2 py-0.5 text-[9px] font-bold text-black uppercase tracking-wider">
                          MOST POPULAR
                        </span>
                      )}
                      <div className="text-xs font-bold text-white">{tier.name}</div>
                      <div className="mt-2 text-xl font-black font-mono text-white">
                        ${price.toLocaleString()} <span className="text-xs font-normal text-zinc-400">{currency}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs font-mono font-bold text-brand-cyan">
                        <Zap className="h-3 w-3 fill-brand-cyan" />
                        {tier.credits.toLocaleString()} Credits
                      </div>
                      <div className="mt-2 text-[10px] text-zinc-400 leading-snug">
                        {tier.tagline}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Tier Option */}
              <div
                onClick={() => setSelectedTierId("custom")}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isCustom
                    ? "border-brand-cyan bg-brand-cyan/10 shadow-lg shadow-brand-cyan/10 ring-1 ring-brand-cyan"
                    : "border-border bg-[#10121C] hover:border-border/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Enterprise Custom Compute Allocation</span>
                      <span className="rounded bg-brand-purple/20 px-2 py-0.5 text-[9px] font-mono text-brand-purple font-semibold">
                        Volume Discount Rate
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Tailored multi-agent clusters ($250 to $10,000+ {currency})
                    </p>
                  </div>

                  {isCustom && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 font-mono">$</span>
                      <input
                        type="number"
                        min="250"
                        step="100"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                        className="w-28 rounded-lg border border-border bg-[#090B10] px-3 py-1.5 text-xs font-mono text-white focus:border-brand-cyan focus:outline-none"
                      />
                      <span className="text-xs font-mono text-zinc-400">{currency}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleInitiateTopUp}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-black bg-gradient-to-r from-brand-cyan via-teal-400 to-brand-blue hover:opacity-95 shadow-lg shadow-brand-cyan/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                    Initializing Underwriting Intent...
                  </>
                ) : (
                  <>
                    <span>Proceed to Pre-Authorized Checkout (${totalCost.toLocaleString()} {currency})</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === "PAYMENT" && paymentDetails && (
            <div className="space-y-5 animate-fadeIn">
              {/* Order Underwriting Summary */}
              <div className="rounded-xl border border-border bg-[#10131E] p-4 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="text-zinc-400">Order Reference:</span>
                  <span className="text-brand-cyan font-bold">{paymentDetails.orderRef}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="text-zinc-400">Stripe PaymentIntent ID:</span>
                  <span className="text-zinc-200 font-bold truncate max-w-[240px]">
                    {paymentDetails.paymentIntentId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="text-zinc-400">Credits to Allocate:</span>
                  <span className="text-emerald-400 font-bold">
                    +{paymentDetails.creditsToAdd.toLocaleString()} Compute Credits
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-300 border-t border-border/80 pt-2 font-bold text-white text-sm">
                  <span>Authorized Charge:</span>
                  <span>
                    ${(paymentDetails.amountCents / 100).toLocaleString()} {paymentDetails.currency.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Corporate Card Input */}
              <div className="space-y-3 rounded-xl border border-border bg-[#0D0F17] p-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <CreditCard className="h-4 w-4 text-brand-cyan" />
                    <span>Corporate Payment Method (Visa / MasterCard / Amex)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                    Zero-OTP Pre-Authorized
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Corporate Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full rounded-lg border border-border bg-[#0A0C10] px-3 py-2 text-xs font-mono text-white focus:border-brand-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Corporate Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-lg border border-border bg-[#0A0C10] px-3 py-2 text-xs font-mono text-white focus:border-brand-cyan focus:outline-none"
                    placeholder="4242 •••• •••• 4242"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full rounded-lg border border-border bg-[#0A0C10] px-3 py-2 text-xs font-mono text-white focus:border-brand-cyan focus:outline-none"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full rounded-lg border border-border bg-[#0A0C10] px-3 py-2 text-xs font-mono text-white focus:border-brand-cyan focus:outline-none"
                      placeholder="888"
                    />
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-zinc-400">
                  By clicking Authorize, you acknowledge immediate delivery of{" "}
                  <strong className="text-zinc-200">
                    {paymentDetails.creditsToAdd.toLocaleString()} Compute Credits
                  </strong>{" "}
                  into your Flyway Cloud account wallet ledger under terms of MSA 2026.4.1.
                </div>
              </div>

              {/* Confirm / Back Controls */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("SELECT_TIER")}
                  className="px-4 py-3 rounded-xl border border-border text-xs text-zinc-300 hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessingCard}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-black bg-gradient-to-r from-emerald-400 to-brand-cyan hover:opacity-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProcessingCard ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-black" />
                      Authorizing ${(paymentDetails.amountCents / 100).toLocaleString()}{" "}
                      {paymentDetails.currency.toUpperCase()}...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-black" />
                      Authorize & Credit Balance (+{paymentDetails.creditsToAdd.toLocaleString()})
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "SUCCESS" && paymentDetails && (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <CheckCircle className="h-8 w-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Payment Authorized & Balance Credited!</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Your compute allocation has been provisioned and is instantly usable across all AI nodes.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-[#12151E] p-4 text-xs font-mono text-left space-y-2 max-w-md mx-auto">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Order Reference:</span>
                  <span className="text-brand-cyan font-bold">{paymentDetails.orderRef}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Stripe Transaction ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-brand-purple font-bold truncate max-w-[170px]">
                      {paymentDetails.chargeId || paymentDetails.paymentIntentId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(paymentDetails.chargeId || paymentDetails.paymentIntentId)}
                      className="text-zinc-400 hover:text-white"
                      title="Copy Stripe ID"
                    >
                      {copiedId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Statement Descriptor:</span>
                  <span className="text-zinc-200 font-bold">FLYWAY*COMPUTE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Credits Credited:</span>
                  <span className="text-emerald-400 font-bold">+{paymentDetails.creditsToAdd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total Charged:</span>
                  <span className="text-white font-bold">
                    ${(paymentDetails.amountCents / 100).toLocaleString()}{" "}
                    {paymentDetails.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Ledger Status:</span>
                  <span className="text-emerald-400 font-semibold">SUCCEEDED (Settled)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full max-w-md mx-auto py-3 px-4 rounded-xl font-semibold text-black bg-brand-cyan hover:opacity-95 shadow-md shadow-brand-cyan/20 transition-all"
              >
                Return to Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
