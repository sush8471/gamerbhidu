"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface MenuItem {
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { label: "HOME", href: "/" },
  { label: "BROWSE GAMES", href: "/games" },
  { label: "HOT DEALS", href: "/#hot-deals" },
  { label: "HOW IT WORKS", href: "/#how-it-works" },
  { label: "FAQ", href: "/faq" },
];

const overlayVariants = {
  hidden: { y: "-100%" },
  visible: { y: 0 },
  exit: { y: "-100%" },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0 },
};

export function FullscreenMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Lock body scroll while menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeMenu]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={openMenu}
        className="hover:bg-white/5"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="fullscreen-menu"
      >
        <Menu className="h-5 w-5 text-white" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="fullscreen-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] h-screen w-screen bg-[#000000] text-white flex flex-col"
          >
            {/* Header */}
            <div               className="relative flex h-20 flex-shrink-0 items-center px-4">
              {/* Close button — top-left */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMenu}
                className="hover:bg-white/5"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-white" />
              </Button>

              {/* Logo — centered at top */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="block hover:opacity-90 transition-opacity"
                >
                  <Image
                    src="/new-logo.png"
                    alt="Gamer Bhidu"
                    width={240}
                    height={70}
                    className="h-12 w-auto"
                    priority
                  />
                </Link>
              </div>
            </div>

            {/* Menu content */}
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-1 flex-col min-h-0 px-6"
            >
              <nav className="flex-1 overflow-y-auto py-4 min-h-0">
                <ul className="flex flex-col">
                  {menuItems.map((item, index) => {
                    const isLast = index === menuItems.length - 1;
                    return (
                      <motion.li
                        key={item.label}
                        variants={itemVariants}
                        className={`border-b border-white/10 ${isLast ? "border-b-0" : ""}`}
                      >
                        <Link
                          href={item.href}
                          onClick={closeMenu}
                          className="block py-5 text-lg font-medium uppercase tracking-widest text-white transition-colors hover:text-white/70"
                        >
                          {item.label}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
