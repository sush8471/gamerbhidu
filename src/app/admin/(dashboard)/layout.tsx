"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Gamepad2,
  Home,
  BadgeCheck,
  LogOut,
  Loader2,
  Menu,
  X,
  ChevronRight,
  ShoppingCart,
  Bell,
  Settings,
  ExternalLink,
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);

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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function fetchOrdersCount() {
      try {
        const { count } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });
        setOrdersCount(count || 0);
      } catch {
        // Non-blocking
      }
    }
    fetchOrdersCount();
  }, [pathname]);

  const handleSidebarMouseEnter = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) setCollapsed(false);
  };

  const handleSidebarMouseLeave = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) setCollapsed(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/games", label: "Games Catalog", icon: Gamepad2 },
    { href: "/admin/homepage", label: "Sections", icon: Home },
    { href: "/admin/proofs", label: "Social Proofs", icon: BadgeCheck },
  ];

  const currentPageLabel =
    navItems.find((item) => pathname === item.href)?.label || "Admin Portal";

  // Generate avatar initials from email
  const avatarInitials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : "GB";

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
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={`
          fixed top-0 left-0 h-full z-50
          bg-[#0d0d0d] border-r border-[#1f1f1f]
          flex flex-col flex-shrink-0
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}
          lg:translate-x-0 lg:static lg:sticky lg:top-0 lg:h-screen
          ${collapsed ? "lg:w-[72px]" : "lg:w-64"}
        `}
      >
        {/* Sidebar Header */}
        <div
          className={`relative p-4 border-b border-[#1f1f1f] flex items-center gap-3 overflow-hidden ${
            collapsed ? "lg:justify-center lg:px-3" : "justify-between"
          }`}
        >
          {/* Top subtle silver accent line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          {/* Subtle ambient glow */}
          <div className="pointer-events-none absolute -top-4 -left-4 w-24 h-24 rounded-full bg-white/[0.02] blur-2xl" />
          {/* Avatar + brand */}
          <Link
            href="/"
            className={`flex items-center gap-3 min-w-0 relative ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center flex-shrink-0 text-xs font-black shadow-md border border-white/20">
              GB
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black tracking-wide uppercase text-white truncate leading-none">
                Gamer Bhidu
              </p>
              <p className="text-[10px] font-semibold text-zinc-500 font-mono mt-0.5">
                Admin Console
              </p>
            </div>
          </Link>
          {/* Collapsed mark (desktop) */}
          <Link
            href="/"
            className={`hidden ${
              collapsed ? "lg:flex" : ""
            } items-center justify-center w-9 h-9 rounded-xl bg-white text-black shadow-md border border-white/20 flex-shrink-0`}
            title="Gamer Bhidu Admin"
          >
            <span className="text-xs font-black">GB</span>
          </Link>
          {/* Close — mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors ml-auto"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  collapsed ? "lg:justify-center lg:px-0 lg:py-3 px-4 py-3" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-white/10 text-white font-semibold border border-white/15 shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "group-hover:bg-white/5 text-zinc-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`flex-1 truncate ${collapsed ? "lg:hidden" : ""}`}>
                  {item.label}
                </span>
                {isActive && !collapsed && (
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 hidden lg:block flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-3 border-t border-[#1f1f1f] space-y-2 ${collapsed ? "lg:px-2" : ""}`}>
          {/* User pill */}
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#161616] border border-[#262626] ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white">
              {avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Logged in as
              </p>
              <p
                className="text-xs font-semibold text-gray-200 truncate"
                title={userEmail || ""}
              >
                {userEmail}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center gap-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer ${
              collapsed
                ? "lg:justify-center lg:px-0 lg:py-3 px-4 py-3 justify-center"
                : "px-3 py-2.5"
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top header bar */}
        <header className="h-14 lg:h-16 border-b border-[#1f1f1f] bg-[#0d0d0d]/90 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <button
              id="admin-mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex-shrink-0 p-2 rounded-lg bg-[#1a1a1a] border border-[#262626] text-gray-300 hover:text-white transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Admin
              </p>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 hidden sm:block flex-shrink-0" />
              <h2 className="text-sm lg:text-base font-bold text-white truncate">
                {currentPageLabel}
              </h2>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/admin/orders"
              id="admin-header-orders-btn"
              className="relative p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              title="Store Orders"
            >
              <ShoppingCart className="w-4 h-4" />
              {ordersCount !== null && ordersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-[9px] font-black text-black flex items-center justify-center shadow-sm">
                  {ordersCount > 99 ? "99+" : ordersCount}
                </span>
              )}
            </Link>
            <button
              id="admin-notifications-btn"
              className="relative p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white" />
            </button>
            <button
              id="admin-settings-btn"
              className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <Link
              href="/"
              id="admin-view-storefront-btn"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#1a1a1a] border border-[#262626] rounded-lg hover:border-white/30 hover:text-white text-gray-300 transition-all whitespace-nowrap"
            >
              Storefront
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-5xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
