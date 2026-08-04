"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
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
          upcomingRes,
        ] = await Promise.all([
          supabase.from("games").select("*", { count: "exact", head: true }),
          supabase.from("games").select("*", { count: "exact", head: true }).eq("visible", true),
          supabase.from("games").select("*", { count: "exact", head: true }).eq("visible", false),
          supabase.from("games").select("*", { count: "exact", head: true }).eq("release_status", "upcoming"),
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

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Row */}
      <div className="flex items-center gap-6 border-b border-border pb-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Visible", value: stats.visible },
          { label: "Hidden", value: stats.hidden },
          { label: "Upcoming", value: stats.upcoming },
        ].map((s) => (
          <Link key={s.label} href="/admin/games" className="group">
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Welcome + Quick Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Welcome, Administrator</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Games", desc: "Add, edit, hide, or delete listings", href: "/admin/games" },
            { label: "Homepage", desc: "Manage sections, games, and combos", href: "/admin/homepage" },
            { label: "Combos", desc: "Create and manage bundle deals", href: "/admin/combos" },
            { label: "Social Proofs", desc: "Upload and manage Trusted By images", href: "/admin/proofs" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-colors"
            >
              <h4 className="text-sm font-semibold text-white">{item.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
