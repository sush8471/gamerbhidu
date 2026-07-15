"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/admin");
      } else {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShake(false);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      setShake(true);
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setShake(true);
      } else if (data.session) {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setShake(true);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080A10] flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#00D2FF]" />
        <p className="text-sm font-medium tracking-wide text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080A10] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#00D2FF]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          x: shake ? [-10, 10, -10, 10, -5, 5, -2, 2, 0] : 0,
        }}
        transition={{
          y: { duration: 0.5, ease: "easeOut" },
          x: { duration: 0.4 },
        }}
        className="w-full max-w-md bg-[#121622]/60 backdrop-blur-xl border border-[#202838] rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative z-10"
      >
        <div className="text-center space-y-2 mb-8">
          <Link href="/" className="inline-block text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-[#00D2FF] to-[#00F0FF] bg-clip-text text-transparent">
            Gamer Bhidu
          </Link>
          <h2 className="text-lg font-bold text-white tracking-wide">Administration Console</h2>
          <p className="text-xs text-gray-400">Sign in with your admin credentials to continue</p>
        </div>

        {/* Error Alert Display */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg leading-relaxed">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00D2FF] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gamerbhidu.com"
                className="w-full bg-[#080A10]/50 border border-[#202838] focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF]/20 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00D2FF] transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080A10]/50 border border-[#202838] focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF]/20 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00D2FF] to-[#00B8E6] text-[#080A10] font-black text-sm py-3.5 rounded-lg hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-[#202838] pt-6 flex items-center justify-between text-[11px] text-gray-500">
          <span>Secure AES-256 Auth</span>
          <Link href="/" className="hover:text-white transition-colors">
            Back to storefront
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
