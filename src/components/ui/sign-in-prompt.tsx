"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const PROMPT_DELAY_MS = 15000; // 15 seconds
const DISMISS_STORAGE_KEY = "signin-prompt-dismissed";
const DISMISS_DURATION_HOURS = 24;

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return false;
    const dismissedAt = parseInt(raw, 10);
    const hoursSince = (Date.now() - dismissedAt) / (1000 * 60 * 60);
    return hoursSince < DISMISS_DURATION_HOURS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Context-aware copy based on cart state
// ---------------------------------------------------------------------------

function getPromptCopy(itemCount: number): {
  icon: typeof ShoppingCart;
  heading: string;
  subtext: string;
} {
  if (itemCount > 0) {
    return {
      icon: ShoppingCart,
      heading: `Save your ${itemCount} item${itemCount > 1 ? "s" : ""} across devices`,
      subtext:
        "Sign in so your cart is never lost — access it from any device, anytime.",
    };
  }
  return {
    icon: Package,
    heading: "Sign in for a better experience",
    subtext: "Save your cart, track orders, and get exclusive deals.",
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SignInPrompt() {
  const [visible, setVisible] = useState(false);
  const { isAuthenticated, loading, signIn } = useAuth();
  const { itemCount } = useCart();

  const { icon: PromptIcon, heading, subtext } = getPromptCopy(itemCount);

  useEffect(() => {
    if (loading || isAuthenticated) return;
    if (isDismissed()) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, PROMPT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [loading, isAuthenticated]);

  // Auto-dismiss if user signs in while prompt is visible
  useEffect(() => {
    if (isAuthenticated && visible) {
      setVisible(false);
    }
  }, [isAuthenticated, visible]);

  const handleDismiss = () => {
    setVisible(false);
    markDismissed();
  };

  const handleSignIn = () => {
    setVisible(false);
    signIn();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-[60] w-[360px] max-w-[calc(100vw-3rem)]"
        >
          <div className="relative bg-[#111111] border border-[#262626] rounded-2xl shadow-2xl p-5 overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-[60px] pointer-events-none" />

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="relative">
              <div className="flex items-start gap-3 mb-3">
                {/* Icon — highlighted if there are cart items */}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 border ${
                    itemCount > 0
                      ? "bg-orange-500/10 border-orange-500/30"
                      : "bg-primary/10 border-primary/20"
                  }`}
                >
                  <PromptIcon
                    className={`h-5 w-5 ${itemCount > 0 ? "text-orange-400" : "text-primary"}`}
                  />
                </div>

                <div className="pt-0.5">
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {heading}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {subtext}
                  </p>
                </div>
              </div>

              {/* Cart item count pill */}
              {itemCount > 0 && (
                <div className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                  <ShoppingCart className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs text-muted-foreground">
                    <span className="text-white font-semibold">{itemCount} game{itemCount > 1 ? "s" : ""}</span> in your cart
                  </span>
                </div>
              )}

              {/* Google sign-in button */}
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-[#262626] hover:border-white/20 text-white text-sm font-bold py-3 rounded-xl transition-all active:scale-[0.99]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <button
                onClick={handleDismiss}
                className="w-full mt-2 text-xs text-muted-foreground hover:text-white transition-colors py-1"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
