"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { CartItem } from "@/context/CartContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
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
  orderId,
  items,
  totalPrice,
  userName,
  userEmail,
}: CheckoutModalProps) {
  const [utrNumber, setUtrNumber] = useState("");
  const [showUtrHelp, setShowUtrHelp] = useState(false);

  const itemCount = items.length;

  // Validate UTR: must be exactly 12 numeric digits
  const isValidUtr = /^\d{12}$/.test(utrNumber.trim());

  const buildOrderMessage = () => {
    return [
      `🎮 *Gamer Bhidu Order ${orderId}*`,
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
      "I have completed the UPI payment with UTR above. Please verify and confirm my order!",
    ]
      .filter((l) => l !== null)
      .join("\n");
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Order Summary & Payment</h2>
                  <p className="text-xs text-muted-foreground">
                    Order ID: <span className="text-white font-mono">{orderId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="max-h-[80vh] overflow-y-auto">
              <div className="p-6 space-y-5">

                {/* Customer info (if signed in) */}
                {(userName || userEmail) && (
                  <div className="bg-background/50 rounded-lg p-3 space-y-1 text-sm">
                    {userName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="text-white font-medium">{userName}</span>
                      </div>
                    )}
                    {userEmail && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="text-white font-medium">{userEmail}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Order items */}
                <div className="bg-background/50 rounded-lg p-3 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">{item.name}</span>
                      <span className="text-white font-semibold shrink-0">₹{item.price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-xl font-bold text-white">₹{totalPrice}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">Scan QR Code to pay via UPI</p>
                  <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                    <Image
                      src="/payment-qr.png"
                      alt="Payment QR Code"
                      width={180}
                      height={180}
                      className="w-full h-auto"
                      priority
                    />
                  </div>
                  <div className="px-4 py-2.5 bg-background/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-0.5">UPI ID</p>
                    <p className="text-sm text-white font-mono font-semibold">
                      sushantcha00123@okicici
                    </p>
                  </div>
                </div>

                {/* Secure UTR verification input */}
                <div className="bg-background/40 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-green-400" />
                      Enter 12-Digit UPI UTR / Ref No. <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowUtrHelp(!showUtrHelp)}
                      className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      What's this?
                    </button>
                  </div>

                  {showUtrHelp && (
                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                      After paying via GPay, PhonePe, Paytm, or BHIM, open the transaction details to find your 12-digit UTR / UPI Ref ID (e.g. 420198273615).
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={12}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 420198273615 (12 digits)"
                      className="w-full bg-background border border-white/10 focus:border-green-500/50 rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder:text-muted-foreground/50 focus:outline-none transition-all tracking-wider"
                    />
                    {isValidUtr && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-green-400">
                        Valid ✓
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {!utrNumber ? (
                      "Please enter your 12-digit transaction ID after paying."
                    ) : isValidUtr ? (
                      <span className="text-green-400">
                        12-digit UTR entered! Click below to send order on WhatsApp.
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        {12 - utrNumber.length} more digit{12 - utrNumber.length > 1 ? "s" : ""} required (must be 12 digits).
                      </span>
                    )}
                  </p>
                </div>

                {/* WhatsApp Submit Button */}
                <button
                  onClick={handleWhatsApp}
                  disabled={!isValidUtr}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    isValidUtr
                      ? "bg-[#25D366] text-white hover:bg-[#20BA5A] cursor-pointer shadow-lg shadow-green-500/20 active:scale-[0.99]"
                      : "bg-white/10 text-muted-foreground cursor-not-allowed opacity-50"
                  }`}
                >
                  <FaWhatsapp className="h-5 w-5" />
                  {isValidUtr ? "Submit Order on WhatsApp" : "Enter 12-Digit UTR to Proceed"}
                </button>

                <p className="text-xs text-muted-foreground text-center pb-1">
                  Your order & 12-digit UTR will be sent directly via WhatsApp for instant verification.
                </p>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
