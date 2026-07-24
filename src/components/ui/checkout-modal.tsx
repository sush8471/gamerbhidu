"use client";

import { useState } from "react";
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
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [qrFullscreen, setQrFullscreen] = useState(false);

  const itemCount = items.length;

  // Validate UTR: must be exactly 12 numeric digits
  const isValidUtr = /^\d{12}$/.test(utrNumber.trim());

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

  const handleCopyOrder = async () => {
    const message = buildCopyMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
                    <h2 className="text-base font-bold text-white">Complete Payment</h2>
                    <p className="text-xs text-muted-foreground">Scan QR to pay via UPI</p>
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
                  {/* Clickable header */}
                  <button
                    type="button"
                    onClick={() => setOrderExpanded((v) => !v)}
                    className="w-full flex items-center justify-between cursor-pointer select-none"
                  >
                    <span className="text-sm font-bold text-white">
                      Order ({itemCount} game{itemCount > 1 ? "s" : ""})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">₹{totalPrice}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                          orderExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Collapsible items */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      orderExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pt-2 space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate mr-2">{item.name}</span>
                          <span className="text-white font-semibold shrink-0">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-xl font-bold text-white">₹{totalPrice}</span>
                  </div>
                </div>

                {/* Copy order */}
                <button
                  onClick={handleCopyOrder}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {copied ? (
                    <><Check className="h-4 w-4 text-green-400" /><span className="text-green-400">Copied!</span></>
                  ) : (
                    <><Copy className="h-4 w-4" /><span>Copy Order</span></>
                  )}
                </button>

                {/* QR Code — tap to enlarge on mobile */}
                <div className="text-center space-y-3">
                  <button
                    type="button"
                    onClick={() => setQrFullscreen(true)}
                    className="bg-white p-3 rounded-xl inline-block shadow-lg cursor-pointer active:scale-[0.97] transition-transform relative group"
                  >
                    <Image
                      src="/payment-qr.png"
                      alt="Payment QR Code"
                      width={180}
                      height={180}
                      className="w-full h-auto"
                      priority
                    />
                    <span className="absolute top-2 right-2 bg-black/50 rounded-md p-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-3 w-3 text-white" />
                    </span>
                  </button>
                  <p className="text-xs text-muted-foreground font-mono">sushantcha00123@okicici</p>
                </div>

                {/* UTR input — simplified */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                    Enter 12-Digit UTR / Ref No. <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={12}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 420198273615"
                      className="w-full bg-background border border-white/10 focus:border-green-500/50 rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder:text-muted-foreground/50 focus:outline-none transition-all tracking-wider"
                    />
                    {isValidUtr && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-green-400">
                        Valid ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {!utrNumber
                      ? "Find this 12-digit ID in your GPay / PhonePe / Paytm transaction details."
                      : isValidUtr
                        ? <span className="text-green-400">Ready to submit!</span>
                        : <span className="text-amber-400">{12 - utrNumber.length} more digit{12 - utrNumber.length > 1 ? "s" : ""}</span>
                    }
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

          {/* Fullscreen QR viewer */}
          <AnimatePresence>
            {qrFullscreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6 cursor-pointer"
                onClick={() => setQrFullscreen(false)}
              >
                <button
                  onClick={() => setQrFullscreen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-2xl max-w-xs w-full"
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
                <p className="text-white/60 text-sm mt-4 font-mono">sushantcha00123@okicici</p>
                <p className="text-white/40 text-xs mt-2">Tap anywhere to close</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
