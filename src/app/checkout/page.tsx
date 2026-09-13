"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CheckoutModal } from "@/components/ui/checkout-modal";
import { UserAvatar } from "@/components/ui/user-avatar";
import GamerBhiduNavbar from "@/components/sections/gamerbhidu-navbar";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, Lock, Pencil, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const { cart, totalPrice, itemCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Auto-fill from Google profile, user can edit
  const [name, setName] = useState(
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? ""
  );
  const [email, setEmail] = useState(user?.email ?? "");

  const [modalOpen, setModalOpen] = useState(false);
  const [orderExpanded, setOrderExpanded] = useState(false);

  // Auto-expand on desktop, collapsed on mobile
  useState(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setOrderExpanded(true);
    }
  });

  const handleProceed = () => {
    if (cart.length === 0) return;
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  // Empty cart — redirect back
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <GamerBhiduNavbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
          <ShoppingBag className="h-20 w-20 text-white/10" />
          <h1 className="text-2xl font-bold text-white">Your cart is empty</h1>
          <p className="text-muted-foreground">Add some games before checking out.</p>
          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors font-medium"
          >
            Browse Games
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GamerBhiduNavbar />

      <div className="py-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">

            {/* ── Left column: Contact info ──────────────────── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Contact Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-white">Contact Information</h2>
                  {isAuthenticated && (
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={user?.user_metadata?.full_name ?? user?.email}
                        avatarUrl={user?.user_metadata?.avatar_url}
                        size={24}
                      />
                      <span className="text-xs text-green-400 font-medium">Auto-filled ✓</span>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors pr-8"
                      />
                      <Pencil className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors pr-8"
                      />
                      <Pencil className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                  </div>
                </div>

                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground mt-3">
                    <Link href="/" className="text-primary hover:underline">Sign in with Google</Link>
                    {" "}to auto-fill your details and save order history.
                  </p>
                )}
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-card border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4">Payment Method</h2>
                <div className="flex items-center gap-3 p-4 bg-background/50 border border-primary/20 rounded-xl">
                  <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">UPI Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Scan the QR code on the next screen to pay
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Image
                      src="/payment-qr.png"
                      alt="QR preview"
                      width={40}
                      height={40}
                      className="rounded opacity-60"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Trust badges */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500 font-medium">Secure checkout</span>
                <span>•</span>
                <span>Instant delivery after payment</span>
                <span>•</span>
                <span>100% original games</span>
              </div>
            </div>

            {/* ── Right column: Order summary ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-card border border-white/10 rounded-2xl p-6 sticky top-24">
                {/* Clickable header */}
                <button
                  onClick={() => setOrderExpanded((v) => !v)}
                  className="w-full flex items-center justify-between mb-5 cursor-pointer select-none"
                >
                  <h2 className="text-lg font-semibold text-white">
                    Order Summary
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({itemCount} item{itemCount > 1 ? "s" : ""})
                    </span>
                  </h2>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                      orderExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Collapsible items list */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    orderExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-3 mb-5">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-10 h-14 shrink-0 rounded overflow-hidden border border-white/10">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{item.name}</p>
                          {item.originalPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              ₹{item.originalPrice}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-white font-semibold shrink-0">
                          ₹{item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-white/10 pt-4 space-y-2 text-sm mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span className="text-green-500">FREE</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleProceed}
                  disabled={cart.length === 0}
                  className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold hover:bg-[#20BA5A] disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                >
                  Proceed to Payment →
                </button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  You&apos;ll scan a UPI QR code on the next step
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      <CheckoutModal
        open={modalOpen}
        onClose={handleModalClose}
        items={cart}
        totalPrice={totalPrice}
        userId={user?.id}
        userName={name || undefined}
        userEmail={email || undefined}
        onOrderCreated={() => clearCart()}
      />

      <Footer />
    </div>
  );
}
