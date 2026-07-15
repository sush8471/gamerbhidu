"use client"

import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook, ArrowUp } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

const socialLinks = [
  {
    href: "https://www.instagram.com/steam_rush/",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://www.facebook.com/profile.php?id=61581460503750",
    label: "Facebook",
    icon: Facebook,
  },
  {
    href: "https://wa.me/917752805529?text=Hi! I want to buy a game",
    label: "WhatsApp",
    icon: FaWhatsapp,
  },
]

const popularGames = [
  { href: "/games/gta-v", label: "Grand Theft Auto V" },
  { href: "/games/red-dead-redemption-2", label: "Red Dead Redemption 2" },
  { href: "/games/cyberpunk-2077", label: "Cyberpunk 2077" },
  { href: "/games/elden-ring", label: "Elden Ring" },
  { href: "/games/the-last-of-us-part-i", label: "The Last of Us Part I" },
  { href: "/games/assassins-creed-valhalla", label: "Assassin's Creed Valhalla" },
  { href: "/games", label: "Browse All Games →" },
]

const companyLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "https://wa.me/917752805529", label: "Contact & Support" },
  { href: "/#how-it-works", label: "How It Works" },
]

const legalLinks = [
  { href: "#", label: "Terms of Use" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Refund Policy" },
  { href: "#", label: "Cookie Policy" },
]

function FooterLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http")
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="block text-sm text-muted-foreground hover:text-white transition-colors"
    >
      {label}
    </Link>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="section-heading text-sm mb-4">{title}</h3>
      <nav className="space-y-2.5">
        {children}
      </nav>
    </div>
  )
}

export function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative border-t border-white/10 bg-background text-white transition-colors duration-300">
      {/* Main Footer Grid */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid gap-8 md:gap-12 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Follow Us */}
          <FooterColumn title="Follow Us">
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                )
              })}
            </div>
          </FooterColumn>

          {/* Popular Games */}
          <FooterColumn title="Popular Games">
            {popularGames.map((game) => (
              <FooterLink key={game.href} href={game.href} label={game.label} />
            ))}
          </FooterColumn>

          {/* Company */}
          <FooterColumn title="Company">
            {companyLinks.map((link) => (
              <FooterLink key={link.href} href={link.href} label={link.label} />
            ))}
          </FooterColumn>

          {/* Legal */}
          <FooterColumn title="Legal">
            {legalLinks.map((link) => (
              <FooterLink key={link.label} href={link.href} label={link.label} />
            ))}
          </FooterColumn>

          {/* Back to Top */}
          <div className="hidden lg:flex lg:justify-end">
            <button
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-200"
              aria-label="Back to top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center gap-4">
            {/* Logo */}
            <Image
              src="/new-logo.png"
              alt="Gamer Bhidu"
              width={180}
              height={50}
              className="h-8 w-auto opacity-80"
            />
            
            {/* Copyright */}
            <p className="text-xs text-muted-foreground text-center">
              © 2026 Gamer Bhidu. All rights reserved.
            </p>
            
            <p className="text-xs text-muted-foreground/60 text-center">
              Made with ❤️ for Indian Gamers
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
