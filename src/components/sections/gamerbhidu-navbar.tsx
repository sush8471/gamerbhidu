"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  LogOut,
  User,
  ChevronDown,
  PackageOpen,
  Heart,
  Trophy,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { NavbarSearch } from "@/components/ui/navbar-search";
import { FullscreenMenu } from "@/components/ui/fullscreen-menu";

// ---------------------------------------------------------------------------
// Dropdown menu items
// ---------------------------------------------------------------------------

const MENU_ITEMS = [
  { href: "/orders",           icon: PackageOpen, label: "My Orders"        },
  { href: "/wishlist",         icon: Heart,       label: "Wishlist"         },
  { href: "/rewards",          icon: Trophy,      label: "My Rewards"       },
  { href: "/profile/settings", icon: Settings,    label: "Profile Settings" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GamerBhiduNavbar() {
  const { itemCount } = useCart();
  const { user, loading, isAuthenticated, signIn, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">

        {/* ── Left: hamburger + logo ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <FullscreenMenu />
          </div>

          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <Image
              src="/new-logo.png"
              alt="Gamer Bhidu - Affordable Gaming"
              width={240}
              height={70}
              className="h-12 sm:h-14 w-auto"
              priority
            />
          </Link>
        </div>

        {/* ── Centre: search (desktop) ──────────────────────────────── */}
        <div className="hidden lg:block lg:w-96 max-w-2xl">
          <NavbarSearch />
        </div>

        {/* ── Right: nav + auth + search (mobile) + cart ───────────── */}
        <div className="flex items-center gap-2">

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/games"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            >
              Browse Games
            </Link>
            <Link
              href="/faq"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            >
              FAQ
            </Link>
          </nav>

          {/* Auth section */}
          {!loading && (
            <div className="flex items-center gap-2">
              {isAuthenticated && user ? (
                /* ── Authenticated: avatar + dropdown ─── */
                <div ref={dropdownRef} className="relative">
                  <button
                    id="navbar-user-menu"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 px-2 py-1.5 text-xs text-white border border-white/10 hover:border-white/20 transition-all"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    <UserAvatar
                      name={user.user_metadata?.full_name ?? user.email}
                      avatarUrl={user.user_metadata?.avatar_url}
                      size={22}
                    />
                    <span className="hidden sm:inline max-w-[100px] truncate font-medium">
                      {firstName}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+8px)] w-60 bg-[#111111] border border-[#262626] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      {/* User info header */}
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                        <UserAvatar
                          name={user.user_metadata?.full_name ?? user.email}
                          avatarUrl={user.user_metadata?.avatar_url}
                          size={36}
                        />
                        <div className="min-w-0">
                          <p className="text-sm text-white font-semibold truncate">
                            {user.user_metadata?.full_name ?? firstName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Navigation links */}
                      <div className="py-1">
                        {MENU_ITEMS.map(({ href, icon: Icon, label }) => (
                          <Link
                            key={href}
                            href={href}
                            role="menuitem"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                          </Link>
                        ))}
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-white/5 pt-1">
                        <button
                          role="menuitem"
                          onClick={() => {
                            signOut();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Guest: Sign In button ─────────────── */
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signIn}
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white gap-1.5 text-xs font-semibold px-4"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}
            </div>
          )}

          {/* Mobile search */}
          <div className="lg:hidden">
            <NavbarSearch />
          </div>

          {/* Cart icon */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative hover:bg-white/5"
            aria-label="Shopping cart"
          >
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5 text-white" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs font-bold"
                >
                  {itemCount}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
