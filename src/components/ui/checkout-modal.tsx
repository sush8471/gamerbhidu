"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, Copy, Check, ChevronDown, Maximize2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { CartItem } from "@/context/CartContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  /** Pre-filled from Google profile — optional */
  userName?: string;
  userEmail?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckoutModal({
  open,
  onClose,
  items,
  totalPrice,
  userName,
  userEmail,
}: CheckoutModalProps) {
  const [utrNumber, setUtrNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [qrFullscreen, setQrFullscreen] = useState(false);

  const itemCount = items.length;
  const upiId = "sushantcha00123@okicici";

  // Validate UTR: must be exactly 12 numeric digits
  const isValidUtr = /^\d{12}$/.test(utrNumber.trim());

  // Lock background scroll while modal is open (iOS-safe)
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { body, documentElement } = document;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      htmlOverflow: documentElement.style.overflow,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      documentElement.style.overflow = prev.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Close fullscreen QR on escape; reset when modal closes
  useEffect(() => {
    if (!open) {
      setQrFullscreen(false);
      setOrderExpanded(false);
    }
  }, [open]);

  const buildOrderMessage = () => {
    return [
      `🎮 *Gamer Bhidu Purchase*`,
      "",
      userName ? `👤 *Customer:* ${userName}` : null,
      userEmail ? `📧 *Email:* ${userEmail}` : null,
      "",
      `📦 *Games (${itemCount}):*`,
      ...items.map((item, i) => `${i + 1}. ${item.name} - ₹${item.price}`),
      "",
      `💰 *Total Paid:* ₹${totalPrice}`,
      `💳 *UPI UTR / Ref No:* ${utrNumber.trim()}`,
      "",
      "I have completed the UPI payment with UTR above. Please verify and confirm!",
    ]
      .filter((l) => l !== null)
      .join("\n");
  };

  const buildCopyMessage = () => {
    return [
      `Gamer Bhidu - Order`,
      "",
      userName ? `Name: ${userName}` : null,
      userEmail ? `Email: ${userEmail}` : null,
      "",
      `Games (${itemCount}):`,
      ...items.map((item, i) => `${i + 1}. ${item.name} - ₹${item.price}`),
      "",
      `Total: ₹${totalPrice}`,
      utrNumber.trim() ? `UPI UTR: ${utrNumber.trim()}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");
  };

  const copyText = async (text: string, onSuccess: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onSuccess();
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      onSuccess();
    }
  };

  const handleCopyOrder = async () => {
    await copyText(buildCopyMessage(), () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyUpi = async () => {
    await copyText(upiId, () => {
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2000);
    });
  };

  const handleWhatsApp = () => {
    if (!isValidUtr) return;
    const message = buildOrderMessage();
    window.open(
      `https://wa.me/917752805529?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm sm:p-4"
          onClick={() => {
            if (!qrFullscreen) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col bg-card border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-1">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-2 sm:pt-5 pb-3 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-green-500/15 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div className="min-w-0">
                  <h2 id="checkout-modal-title" className="text-sm sm:text-base font-bold text-white leading-tight">
                    Complete Payment
                  </h2>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">Scan QR to pay via UPI</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-4">
              {/* Customer info */}
              {(userName || userEmail) && (
                <div className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5 space-y-1.5 text-xs sm:text-sm">
                  {userName && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground shrink-0">Name</span>
                      <span className="text-white font-medium text-right truncate">{userName}</span>
                    </div>
                  )}
                  {userEmail && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground shrink-0">Email</span>
                      <span className="text-white font-medium text-right break-all">{userEmail}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order summary */}
              <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOrderExpanded((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-3 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
                  aria-expanded={orderExpanded}
                >
                  <span className="text-sm font-semibold text-white">
                    Order
                    <span className="ml-1.5 text-muted-foreground font-normal">
                      ({itemCount} game{itemCount !== 1 ? "s" : ""})
                    </span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-white tabular-nums">₹{totalPrice}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 ${
                        orderExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    orderExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2.5">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 text-xs sm:text-sm">
                        <span className="text-muted-foreground truncate">{item.name}</span>
                        <span className="text-white font-medium shrink-0 tabular-nums">₹{item.price}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-xs font-semibold text-white">Total</span>
                      <span className="text-base font-bold text-white tabular-nums">₹{totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy order */}
              <div className="flex justify-center">
                <button
                  onClick={handleCopyOrder}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white/90 transition-all active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Order</span>
                    </>
                  )}
                </button>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-2.5 py-1">
                <button
                  type="button"
                  onClick={() => setQrFullscreen(true)}
                  className="relative bg-white p-2.5 sm:p-3 rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
                  aria-label="Enlarge QR code"
                >
                  <Image
                    src="/payment-qr.png"
                    alt="Payment QR Code"
                    width={168}
                    height={168}
                    className="w-[148px] h-[148px] sm:w-[168px] sm:h-[168px] object-contain"
                    priority
                  />
                  <span className="absolute top-2 right-2 bg-black/55 rounded-md p-1">
                    <Maximize2 className="h-3 w-3 text-white" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-muted-foreground hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                >
                  {upiCopied ? (
                    <>
                      <Check className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">UPI ID copied</span>
                    </>
                  ) : (
                    <>
                      <span>{upiId}</span>
                      <Copy className="h-3 w-3 opacity-60" />
                    </>
                  )}
                </button>
              </div>

              {/* UTR input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                  12-Digit UTR / Ref No.
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 420198273615"
                    className="w-full bg-background border border-white/10 focus:border-green-500/50 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-muted-foreground/40 focus:outline-none transition-all tracking-wider"
                  />
                  {isValidUtr && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-green-400">
                      Valid ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {!utrNumber
                    ? "Find this in your GPay / PhonePe / Paytm transaction details."
                    : isValidUtr
                      ? <span className="text-green-400">Ready to submit!</span>
                      : <span className="text-amber-400">{12 - utrNumber.length} more digit{12 - utrNumber.length !== 1 ? "s" : ""} needed</span>
                  }
                </p>
              </div>
            </div>

            {/* Sticky footer CTA */}
            <div
              className="shrink-0 border-t border-white/5 px-4 sm:px-5 pt-3 bg-card/95 backdrop-blur-md space-y-2"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              <button
                onClick={handleWhatsApp}
                disabled={!isValidUtr}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  isValidUtr
                    ? "bg-[#25D366] text-white hover:bg-[#20BA5A] shadow-lg shadow-green-500/15 active:scale-[0.99]"
                    : "bg-white/10 text-muted-foreground cursor-not-allowed opacity-50"
                }`}
              >
                <FaWhatsapp className="h-4 w-4" />
                {isValidUtr ? "Submit Order on WhatsApp" : "Enter UTR to Proceed"}
              </button>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center leading-snug pb-0.5">
                Order details & UTR are sent on WhatsApp for verification.
              </p>
            </div>
          </motion.div>

          {/* Fullscreen QR viewer — stopPropagation so parent modal stays open */}
          <AnimatePresence>
            {qrFullscreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-6 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setQrFullscreen(false);
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQrFullscreen(false);
                  }}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Close QR"
                >
                  <X className="h-5 w-5" />
                </button>
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xl max-w-xs w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src="/payment-qr.png"
                    alt="Payment QR Code"
                    width={400}
                    height={400}
                    className="w-full h-auto"
                    priority
                  />
                </motion.div>
                <p className="text-white/70 text-sm mt-4 font-mono">{upiId}</p>
                <p className="text-white/40 text-xs mt-2">Tap anywhere to close</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
