"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  Gamepad2,
  EyeOff,
  Users,
  Library,
  Plus,
  ChevronRight,
  LayoutGrid,
  BadgeCheck,
  Tag,
  ShoppingBag,
  BarChart3,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  total: number;
  hidden: number;
  socialProofs: number;
  combos: number;
  orders: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    hidden: 0,
    socialProofs: 0,
    combos: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [totalRes, hiddenRes, proofsRes, combosRes, ordersRes] =
          await Promise.all([
            supabase.from("games").select("*", { count: "exact", head: true }),
            supabase
              .from("games")
              .select("*", { count: "exact", head: true })
              .eq("visible", false),
            supabase
              .from("social_proofs")
              .select("*", { count: "exact", head: true }),
            supabase.from("combos").select("*", { count: "exact", head: true }),
            supabase.from("orders").select("*", { count: "exact", head: true }),
          ]);

        setStats({
          total: totalRes.count || 0,
          hidden: hiddenRes.count || 0,
          socialProofs: proofsRes.count || 0,
          combos: combosRes.count || 0,
          orders: ordersRes.count || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const statCards = [
    {
      label: "Active Games",
      value: stats.total - stats.hidden,
      icon: Gamepad2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      href: "/admin/games",
    },
    {
      label: "Hidden",
      value: stats.hidden,
      icon: EyeOff,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      href: "/admin/games",
    },
    {
      label: "Social Proofs",
      value: stats.socialProofs,
      icon: Users,
      color: "text-zinc-200",
      bg: "bg-zinc-900/60",
      border: "border-zinc-800",
      href: "/admin/proofs",
    },
    {
      label: "Total Titles",
      value: stats.total,
      icon: Library,
      color: "text-white",
      bg: "bg-zinc-900/60",
      border: "border-zinc-800",
      href: "/admin/games",
    },
  ];

  const quickLinks = [
    {
      label: "Games Catalog",
      desc: "Add, edit and manage your games",
      icon: Gamepad2,
      iconBg: "bg-white/10",
      iconColor: "text-white",
      badge: stats.total,
      badgeColor: "bg-zinc-800 text-zinc-200 border-zinc-700",
      href: "/admin/games",
    },
    {
      label: "Social Proofs",
      desc: "Manage reviews, screenshots & more",
      icon: BadgeCheck,
      iconBg: "bg-white/10",
      iconColor: "text-white",
      badge: stats.socialProofs,
      badgeColor: "bg-zinc-800 text-zinc-200 border-zinc-700",
      href: "/admin/proofs",
    },
    {
      label: "Store Sections",
      desc: "Organize your homepage layout",
      icon: LayoutGrid,
      iconBg: "bg-white/10",
      iconColor: "text-white",
      badge: null,
      badgeColor: "",
      href: "/admin/homepage",
    },
    {
      label: "Combo Deals",
      desc: "Create and manage deal bundles",
      icon: Tag,
      iconBg: "bg-white/10",
      iconColor: "text-white",
      badge: stats.combos,
      badgeColor: "bg-zinc-800 text-zinc-200 border-zinc-700",
      href: "/admin/combos",
    },
    {
      label: "Orders & Ledger",
      desc: "Track orders, payments and earnings",
      icon: ShoppingBag,
      iconBg: "bg-white/10",
      iconColor: "text-white",
      badge: stats.orders,
      badgeColor: "bg-zinc-800 text-zinc-200 border-zinc-700",
      href: "/admin/orders",
    },
  ];

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262626] bg-gradient-to-b from-[#141414] via-[#0d0d0d] to-[#070707] p-6 lg:p-8 shadow-xl">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/[0.02] blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-mono mb-1">
              Welcome back
            </p>
            <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight">
              Manage Your Game Store
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Everything you need, in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-400 italic">
              Play · Manage · Grow
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`group relative overflow-hidden rounded-xl border ${card.border} ${card.bg} p-4 lg:p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.bg} border ${card.border}`}
                >
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <ArrowUpRight
                  className={`w-3.5 h-3.5 ${card.color} opacity-0 group-hover:opacity-70 transition-opacity`}
                />
              </div>
              <p className={`text-3xl font-black mt-3 ${card.color}`}>
                {card.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                {card.label}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Tiles (Modern Black Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tile 1: Add Game / Steam */}
        <Link
          href="/admin/games"
          className="group relative overflow-hidden rounded-2xl bg-[#111111] hover:bg-[#161616] border border-[#262626] hover:border-white/20 p-4 transition-all duration-200 hover:scale-[1.01] shadow-lg flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white group-hover:text-zinc-200 transition-colors">
                + Add Title
              </p>
              <p className="text-[11px] text-zinc-400 font-medium truncate">
                Instant Steam Fetch
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
        </Link>

        {/* Tile 2: Social Proofs / Reviews */}
        <Link
          href="/admin/proofs"
          className="group relative overflow-hidden rounded-2xl bg-[#111111] hover:bg-[#161616] border border-[#262626] hover:border-white/20 p-4 transition-all duration-200 hover:scale-[1.01] shadow-lg flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:scale-105 transition-transform">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white group-hover:text-zinc-200 transition-colors">
                Reviews & Proofs
              </p>
              <p className="text-[11px] text-zinc-400 font-medium truncate">
                {stats.socialProofs} published proofs
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
        </Link>

        {/* Tile 3: Orders / Ledger */}
        <Link
          href="/admin/orders"
          className="group relative overflow-hidden rounded-2xl bg-[#111111] hover:bg-[#161616] border border-[#262626] hover:border-white/20 p-4 transition-all duration-200 hover:scale-[1.01] shadow-lg flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white group-hover:text-zinc-200 transition-colors">
                Store Orders
              </p>
              <p className="text-[11px] text-zinc-400 font-medium truncate">
                {stats.orders} total orders
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
        </Link>
      </div>

      {/* Quick Access */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Quick Access</h2>
            <p className="text-xs text-muted-foreground">
              Manage and grow your store
            </p>
          </div>
          <Link
            href="/admin/games"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden divide-y divide-[#1a1a1a]">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Growth Insight Strip */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262626] bg-[#111111] p-5 flex items-center justify-between gap-4">
        <div className="relative flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Track your growth</p>
            <p className="text-xs text-muted-foreground">
              View analytics, sales and more
            </p>
          </div>
        </div>
        <Link
          href="/admin/orders"
          className="relative flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all duration-200 shadow-md"
        >
          View Insights
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
