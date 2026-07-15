"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Gamepad2, Eye, EyeOff, Calendar, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
    upcoming: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          totalRes,
          visibleRes,
          hiddenRes,
          upcomingRes
        ] = await Promise.all([
          supabase.from("games").select("*", { count: "exact", head: true }),
          supabase.from("games").select("*", { count: "exact", head: true }).eq("visible", true),
          supabase.from("games").select("*", { count: "exact", head: true }).eq("visible", false),
          supabase.from("games").select("*", { count: "exact", head: true }).eq("release_status", "upcoming")
        ]);

        setStats({
          total: totalRes.count || 0,
          visible: visibleRes.count || 0,
          hidden: hiddenRes.count || 0,
          upcoming: upcomingRes.count || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const cardItems = [
    {
      title: "Total Listings",
      value: stats.total,
      icon: Gamepad2,
      color: "from-blue-500/20 to-indigo-500/5",
      iconColor: "text-blue-400",
      glowColor: "group-hover:shadow-blue-500/10",
    },
    {
      title: "Visible Storefront Listings",
      value: stats.visible,
      icon: Eye,
      color: "from-emerald-500/20 to-teal-500/5",
      iconColor: "text-emerald-400",
      glowColor: "group-hover:shadow-emerald-500/10",
    },
    {
      title: "Hidden Listings",
      value: stats.hidden,
      icon: EyeOff,
      color: "from-amber-500/20 to-orange-500/5",
      iconColor: "text-amber-400",
      glowColor: "group-hover:shadow-amber-500/10",
    },
    {
      title: "Upcoming Titles",
      value: stats.upcoming,
      icon: Calendar,
      color: "from-[#00D2FF]/20 to-[#00F0FF]/5",
      iconColor: "text-[#00D2FF]",
      glowColor: "group-hover:shadow-[#00D2FF]/10",
    },
  ];

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00D2FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {cardItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`group bg-gradient-to-br ${item.color} border border-[#202838] rounded-xl p-3 lg:p-6 hover:border-[#3B82F6]/30 hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] transition-all duration-300 ${item.glowColor}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1 lg:space-y-2 min-w-0">
                  <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider leading-tight">{item.title}</p>
                  <p className="text-2xl lg:text-3xl font-black text-white tracking-tight">{item.value}</p>
                </div>
                <div className={`p-2 lg:p-3 bg-[#080A10]/55 rounded-lg border border-[#202838]/60 flex-shrink-0 ${item.iconColor}`}>
                  <Icon className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Quick Walkthrough Panel */}
      <div className="bg-[#121622] border border-[#202838] rounded-xl p-4 lg:p-8 space-y-4 lg:space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Welcome, Administrator</h3>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            This administration panel allows you to manage the entire storefront catalog. Modify prices, toggles, metadata tags, and sections live without changing any code or executing redeploys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Link
            href="/admin/games"
            className="flex items-center justify-between p-6 bg-[#080A10]/40 border border-[#202838] rounded-lg hover:border-[#00D2FF]/30 hover:bg-[#00D2FF]/5 transition-all group"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-white group-hover:text-[#00D2FF] transition-colors">Games Catalogue CRUD</h4>
              <p className="text-xs text-gray-500">Add, edit details, hide, or delete games listings</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#00D2FF] transition-all transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/admin/homepage"
            className="flex items-center justify-between p-6 bg-[#080A10]/40 border border-[#202838] rounded-lg hover:border-[#00D2FF]/30 hover:bg-[#00D2FF]/5 transition-all group"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-white group-hover:text-[#00D2FF] transition-colors">Homepage Management</h4>
              <p className="text-xs text-gray-500">Reorder and map listings inside storefront sections</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#00D2FF] transition-all transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
