"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Home, Store, HelpCircle, Menu, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { FaWhatsapp } from "react-icons/fa";
import { NavbarSearch } from "@/components/ui/navbar-search";

interface GameCategory {
  href: string;
  label: string;
  description?: string;
}

const gameCategories: GameCategory[] = [
  { href: "/games#action", label: "Action Games", description: "Fast-paced adventures" },
  { href: "/games#rpg", label: "RPG Games", description: "Immersive role-playing" },
  { href: "/games#fps", label: "FPS/TPS Games", description: "Shooter experiences" },
  { href: "/games#sports", label: "Sports Games", description: "Athletic competitions" },
  { href: "/games#horror", label: "Horror Games", description: "Spine-chilling thrills" },
];

export default function GamerBhiduNavbar() {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isGamesOpen, setIsGamesOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Left Side: Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger - ON LEFT */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden hover:bg-white/5" aria-label="Menu">
                <Menu className="h-5 w-5 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] bg-background border-white/10">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                    <Image
                      src="/new-logo.png"
                      alt="Gamer Bhidu"
                      width={180}
                      height={56}
                      className="h-10 w-auto"
                      priority
                    />
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-6 flex flex-col gap-1">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>

                <Link
                  href="/games"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  <Store className="h-4 w-4" />
                  Browse Games
                </Link>

                <Link
                  href="/faq"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </Link>

                {/* Mobile WhatsApp Button */}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                  <a
                    href="https://wa.me/917752805529?text=Hi! I want to buy a game"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-[#25D366] rounded-lg hover:bg-[#20BA5A] transition-colors font-semibold"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaWhatsapp className="h-4 w-4" />
                    Contact Us
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

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

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
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

          {/* Search Icon - Mobile Only (MOVED HERE) */}
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
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold"
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
