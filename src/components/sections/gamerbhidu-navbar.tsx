"use client";

import * as React from "react";
import { ShoppingCart, Home, Store, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { FaWhatsapp } from "react-icons/fa";
import { NavbarSearch } from "@/components/ui/navbar-search";
import { FullscreenMenu } from "@/components/ui/fullscreen-menu";

export default function GamerBhiduNavbar() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Left Side: Mobile menu trigger + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile-only hamburger */}
          <div className="lg:hidden">
            <FullscreenMenu />
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0">
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

        {/* Search Bar - Desktop Center */}
        <div className="hidden lg:block lg:w-96 max-w-2xl">
          <NavbarSearch />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>

            <Link
              href="/games"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            >
              <Store className="h-4 w-4" />
              Browse Games
            </Link>

            <Link
              href="/faq"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </Link>
          </nav>

          {/* WhatsApp Contact - Desktop */}
          <a
            href="https://wa.me/917752805529?text=Hi! I want to buy a game"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors"
          >
            <FaWhatsapp className="h-4 w-4" />
            Contact Us
          </a>

          {/* Search Icon - Mobile Only */}
          <div className="lg:hidden">
            <NavbarSearch />
          </div>

          {/* Cart */}
          <Button asChild variant="ghost" size="icon" className="relative hover:bg-white/5" aria-label="Shopping cart">
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
