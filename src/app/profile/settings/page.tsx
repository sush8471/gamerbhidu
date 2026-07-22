"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSteam } from "@/context/SteamContext";
import { getProfile, UserProfile } from "@/lib/db/user-db";
import GamerbhiduNavbar from "@/components/sections/gamerbhidu-navbar";
import { FooterSection } from "@/components/sections/footer-section";
import { toast } from "sonner";

import {
  User,
  ShieldCheck,
  Gamepad2,
  Package,
  Heart,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Award,
} from "lucide-react";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const {
    steamId,
    steamProfile,
    ownedAppIds,
    connectSteam,
    disconnectSteam,
    loading: steamLoading,
    error: steamError,
  } = useSteam();

  const [dbProfile, setDbProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [inputSteamId, setInputSteamId] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Load user profile details from Supabase
  useEffect(() => {
    async function loadDbProfile() {
      if (user) {
        try {
          const profile = await getProfile(user.id);
          setDbProfile(profile);
        } catch (err) {
          console.error("Error loading user profile:", err);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setLoadingProfile(false);
      }
    }
    loadDbProfile();
  }, [user]);

  const handleConnectSteam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSteamId.trim()) {
      toast.error("Please enter a Steam ID");
      return;
    }

    setConnecting(true);
    const success = await connectSteam(inputSteamId.trim());
    setConnecting(false);

    if (success) {
      toast.success("Steam account connected successfully!");
      setInputSteamId("");
    } else {
      toast.error(steamError || "Failed to connect Steam ID. Please check the ID.");
    }
  };

  const handleDisconnectSteam = async () => {
    if (confirm("Are you sure you want to disconnect your Steam account?")) {
      await disconnectSteam();
      toast.info("Steam account disconnected");
    }
  };

  // Tier info calculation
  const totalSpent = dbProfile?.total_spent || 0;
  const tier = dbProfile?.loyalty_tier || "bronze";

  const tierColors = {
    bronze: "from-amber-700/20 to-amber-900/10 border-amber-600/30 text-amber-400",
    silver: "from-slate-400/20 to-slate-600/10 border-slate-400/30 text-slate-200",
    gold: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400",
    platinum: "from-cyan-500/20 to-blue-600/10 border-cyan-400/30 text-cyan-300",
  };

  const nextTierInfo = {
    bronze: { target: 1000, nextTier: "Silver" },
    silver: { target: 5000, nextTier: "Gold" },
    gold: { target: 15000, nextTier: "Platinum" },
    platinum: { target: 15000, nextTier: "Max Tier" },
  }[tier];

  const progressPercent = Math.min(
    100,
    Math.round((totalSpent / nextTierInfo.target) * 100)
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <GamerbhiduNavbar />

        <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white">Profile & Settings</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              Account Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile, Steam library connection, and view your loyalty rewards.
            </p>
          </div>

          {!isAuthenticated ? (
            /* Unauthenticated Banner */
            <div className="bg-card/60 border border-border/80 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 backdrop-blur-md">
              <User className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" />
              <h2 className="text-xl font-bold text-white mb-2">
                Sign in to manage your profile
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Sign in with Google to sync your order history, wishlist, and Steam library across devices.
              </p>
              <button
                onClick={signIn}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-primary/20 cursor-pointer"
              >
                Sign In with Google
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: User Profile & Loyalty */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Card */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/40 flex-shrink-0 bg-secondary">
                      {user?.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt={user.user_metadata.full_name || "User Avatar"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white">
                          {user?.email?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h2 className="text-lg font-bold text-white truncate">
                        {user?.user_metadata?.full_name || "Gamer Bhidu User"}
                      </h2>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 mt-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Authenticated
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Navigation */}
                  <div className="space-y-2 pt-4 border-t border-border/60">
                    <Link
                      href="/orders"
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/60 transition-colors text-sm text-foreground hover:text-white"
                    >
                      <span className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-primary" /> My Orders
                      </span>
                      <span className="text-xs bg-secondary text-muted-foreground px-2.5 py-0.5 rounded-full font-medium">
                        {dbProfile?.total_orders || 0}
                      </span>
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/60 transition-colors text-sm text-foreground hover:text-white"
                    >
                      <span className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-rose-500" /> Wishlist
                      </span>
                    </Link>

                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-2.5 p-3 rounded-xl hover:bg-rose-500/10 transition-colors text-sm text-rose-400 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>

                {/* Loyalty Tier Card */}
                <div
                  className={`bg-gradient-to-br border rounded-2xl p-6 relative overflow-hidden ${tierColors[tier]}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      <span className="font-bold text-sm uppercase tracking-wider">
                        {tier} Tier
                      </span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm font-semibold capitalize">
                      Loyalty Member
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                      <div className="text-xs text-muted-foreground">Total Spent</div>
                      <div className="text-lg font-bold text-white mt-0.5">
                        ₹{totalSpent.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                      <div className="text-xs text-muted-foreground">Total Orders</div>
                      <div className="text-lg font-bold text-white mt-0.5">
                        {dbProfile?.total_orders || 0}
                      </div>
                    </div>
                  </div>

                  {/* Progress to next tier */}
                  {tier !== "platinum" && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress to {nextTierInfo.nextTier}</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div
                          className="bg-current h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground text-right mt-1">
                        Spend ₹{(nextTierInfo.target - totalSpent).toLocaleString("en-IN")} more to upgrade
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Steam Integration */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between pb-6 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-sky-400">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Steam Account Connection</h2>
                        <p className="text-xs text-muted-foreground">
                          Sync your Steam library to prevent duplicate buys & unlock custom recommendations.
                        </p>
                      </div>
                    </div>

                    {steamProfile && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </span>
                    )}
                  </div>

                  {steamLoading && !steamProfile ? (
                    <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                      <p className="text-sm">Fetching Steam account details...</p>
                    </div>
                  ) : steamProfile ? (
                    /* Connected State */
                    <div className="py-6 space-y-6">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/40 p-5 rounded-2xl border border-border/60">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-sky-500/40 flex-shrink-0 bg-slate-800">
                            <Image
                              src={steamProfile.avatar}
                              alt={steamProfile.personaName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white">
                                {steamProfile.personaName}
                              </h3>
                              <a
                                href={steamProfile.profileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-sky-400 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              ID: {steamProfile.steamId}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-white">
                              {ownedAppIds.length} Games
                            </div>
                            <div className="text-[11px] text-muted-foreground">Found in Library</div>
                          </div>
                          <button
                            onClick={handleDisconnectSteam}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer border border-rose-500/20"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>

                      {/* Benefits & Features Enabled */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-secondary/20 p-4 rounded-xl border border-border/40 flex gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-white">Library Overlap Warnings</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Games you already own on Steam will feature an &ldquo;Owned&rdquo; badge across our catalog.
                            </p>
                          </div>
                        </div>
                        <div className="bg-secondary/20 p-4 rounded-xl border border-border/40 flex gap-3">
                          <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-white">Custom Recommendations</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              We analyze your Steam play styles to match tailored PC game deals for you.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Connect Steam Form */
                    <div className="py-6 space-y-6">
                      <form onSubmit={handleConnectSteam} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Enter Steam Profile Link, Username, or 17-digit Steam ID
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              value={inputSteamId}
                              onChange={(e) => setInputSteamId(e.target.value)}
                              placeholder="e.g. https://steamcommunity.com/id/gamerflydon/ or 76561198..."
                              className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono"
                            />
                            <button
                              type="submit"
                              disabled={connecting}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg hover:shadow-primary/20"
                            >
                              {connecting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                                </>
                              ) : (
                                "Connect Steam"
                              )}
                            </button>
                          </div>
                        </div>
                      </form>

                      {/* Helpful Steam Link Guide */}
                      <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 font-semibold text-white">
                          <AlertCircle className="w-4 h-4 text-sky-400" /> How to connect your Steam account?
                        </div>
                        <ul className="list-disc list-inside space-y-1 pl-1">
                          <li>
                            Paste your full Steam profile link (e.g., <code className="text-sky-300">https://steamcommunity.com/id/gamerflydon/</code>).
                          </li>
                          <li>
                            Or enter your custom profile URL name or 17-digit Steam ID.
                          </li>
                          <li>
                            Ensure your Steam profile & Game Details privacy settings are set to Public.
                          </li>
                        </ul>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <FooterSection />
    </div>
  );
}
