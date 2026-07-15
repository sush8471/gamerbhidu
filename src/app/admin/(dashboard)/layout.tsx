"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Gamepad2,
  Home,
  LogOut,
  Loader2,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/admin/login");
      } else {
        setUserEmail(session.user.email || "Admin");
        setLoading(false);
      }
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        setUserEmail(session.user.email || "Admin");
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/games", label: "Games Catalog", icon: Gamepad2 },
    { href: "/admin/homepage", label: "Homepage Sections", icon: Home },
  ];

  const currentPageLabel =
    navItems.find((item) => pathname === item.href)?.label || "Admin Portal";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Verifying session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* ── Mobile Overlay Backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-72
          bg-[#111111] border-r border-[#262626]
          flex flex-col flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:w-64 lg:flex lg:sticky lg:top-0 lg:h-screen
        `}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-[#262626] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-base font-black tracking-wider uppercase text-primary">
              Gamer Bhidu
            </span>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
              Admin
            </span>
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#262626] space-y-3">
          <div className="px-4 py-2.5 bg-black/25 rounded-xl border border-[#262626]/50">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
              Logged in as
            </p>
            <p
              className="text-xs font-medium text-gray-300 truncate"
              title={userEmail || ""}
            >
              {userEmail}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Pane ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-14 lg:h-16 border-b border-[#262626] bg-[#111111]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 gap-3">
          {/* Left: Hamburger + Page title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex-shrink-0 p-2 rounded-lg bg-[#262626] text-gray-300 hover:text-white hover:bg-[#2a3448] transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm lg:text-lg font-bold text-white truncate">
              {currentPageLabel}
            </h2>
          </div>

          {/* Right: View Storefront */}
          <Link
            href="/"
            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 bg-[#262626] border border-[#2a3448] rounded-full hover:border-gray-500 text-gray-300 transition-colors whitespace-nowrap"
          >
            View Storefront
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
