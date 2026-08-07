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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Hover-to-expand/collapse — desktop only (>=1024px). No effect on mobile.
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
    { href: "/admin/games", label: "Games Catalog", icon: Gamepad2 },
    { href: "/admin/homepage", label: "Sections", icon: Home },
    { href: "/admin/proofs", label: "Social Proofs", icon: BadgeCheck },
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
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={`
          fixed top-0 left-0 h-full z-50
          bg-[#111111] border-r border-[#262626]
          flex flex-col flex-shrink-0
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}
          lg:translate-x-0 lg:static lg:sticky lg:top-0 lg:h-screen
          ${collapsed ? "lg:w-[72px]" : "lg:w-64"}
        `}
      >
        {/* Header */}
        <div className={`p-4 border-b border-[#262626] flex items-center ${collapsed ? "lg:justify-center" : "justify-between"} gap-2`}>
          <Link href="/" className={`flex items-center gap-2 min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
            <span className="text-base font-black tracking-wider uppercase text-primary truncate">
              Gamer Bhidu
            </span>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 flex-shrink-0">
              Admin
            </span>
          </Link>
          {/* Collapsed logo mark (desktop) */}
          <Link
            href="/"
            className={`hidden ${collapsed ? "lg:flex" : ""} items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20`}
            title="Gamer Bhidu Admin"
          >
            <span className="text-xs font-black text-primary">GB</span>
          </Link>
          {/* Close — mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                  collapsed ? "lg:justify-center lg:px-0 lg:py-3 px-4 py-3" : "px-4 py-3"
                } ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className={`flex-1 truncate ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                {isActive && !collapsed && (
                  <ChevronRight className="w-3.5 h-3.5 opacity-50 hidden lg:block" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-3 border-t border-[#262626] space-y-2 ${collapsed ? "lg:px-2" : ""}`}>
          <div className={`px-3 py-2.5 bg-black/25 rounded-xl border border-[#262626]/50 ${collapsed ? "lg:hidden" : ""}`}>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
              Logged in as
            </p>
            <p className="text-xs font-medium text-gray-300 truncate" title={userEmail || ""}>
              {userEmail}
            </p>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center gap-2 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer ${
              collapsed ? "lg:justify-center lg:px-0 lg:py-3 px-4 py-3 justify-center" : "justify-center px-4 py-3"
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 lg:h-16 border-b border-[#262626] bg-[#111111]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex-shrink-0 p-2.5 rounded-lg bg-[#262626] text-gray-300 hover:text-white hover:bg-[#2a3448] transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm lg:text-lg font-bold text-white truncate">
              {currentPageLabel}
            </h2>
          </div>

          <Link
            href="/"
            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 bg-[#262626] border border-[#2a3448] rounded-full hover:border-gray-500 text-gray-300 transition-colors whitespace-nowrap"
          >
            View Storefront
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
