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

export default function SteamRushNavbar() {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isGamesOpen, setIsGamesOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080A10]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#080A10]/90">
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
            <SheetContent side="left" className="w-[240px] bg-[#080A10] border-[#202838]">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <Image
                    src="/new-logo.png"
                    alt="Gamer Bhidu"
                    width={140}
                    height={44}
                    className="h-8 w-auto"
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

                {/* Mobile Browse Games Collapsible */}
                <Collapsible open={isGamesOpen} onOpenChange={setIsGamesOpen}>
                  <div className="flex items-center w-full">
                    {/* Browse Games Link */}
                    <Link
                      href="/games"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5 flex-1"
                    >
                      <Store className="h-4 w-4" />
                      Browse Games
                    </Link>

                    {/* Chevron Toggle */}
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-white/5"
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-white transition-transform duration-200",
                            isGamesOpen && "rotate-180"
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="ml-7 mt-1 space-y-1 border-l-2 border-[#3B82F6] pl-4">
                    {gameCategories.map((cat) => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        onClick={() => setIsOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm text-[#B0B8D0] transition-colors hover:bg-white/5 hover:text-white"
                      >
                        {cat.label}
                      </Link>
                    ))}
                    <Link
                      href="/games"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-semibold text-[#3B82F6] transition-colors hover:bg-white/5"
                    >
                      View All →
                    </Link>
                  </CollapsibleContent>
                </Collapsible>

                <Link
                  href="/#faq"
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
              width={200}
              height={60}
              className="h-10 sm:h-12 w-auto"
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
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#B0B8D0] transition-colors hover:bg-white/5 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>

          {/* Browse Games Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 text-sm font-medium text-[#B0B8D0] hover:text-white hover:bg-white/5">
                <Store className="h-4 w-4" />
                Browse Games
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-[#121622] border-[#202838]">
              <DropdownMenuLabel className="text-white">Game Categories</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {gameCategories.map((cat) => (
                <DropdownMenuItem key={cat.href} asChild className="focus:bg-white/5 focus:text-white">
                  <Link href={cat.href} className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{cat.label}</span>
                      <span className="text-xs text-[#B0B8D0]">{cat.description}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white">
                <Link href="/games" className="cursor-pointer font-semibold text-[#3B82F6]">
                  View All Games →
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/#faq"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#B0B8D0] transition-colors hover:bg-white/5 hover:text-white"
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
