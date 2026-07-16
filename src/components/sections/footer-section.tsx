"use client"

import Link from "next/link"
import { Instagram, ArrowUp } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

const socialLinks = [
  {
    href: "https://www.instagram.com/gamer_bhidu/",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://wa.me/917752805529?text=Hi! I want to buy a game",
    label: "WhatsApp",
    icon: FaWhatsapp,
  },
]

const browseLinks = [
  { href: "/#hot-deals", label: "Hot Deals" },
  { href: "/#", label: "Value Combos" },
  { href: "/#", label: "Recently Launched" },
  { href: "/games", label: "Browse All Games" },
]

const supportLinks = [
  { href: "/faq", label: "FAQs" },
  { href: "https://wa.me/917752805529", label: "Contact & Support" },
]

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
      <nav className="space-y-1.5">
        {children}
      </nav>
    </div>
  )
}

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

export function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative border-t border-white/10 bg-background text-white transition-colors duration-300">
      {/* Main Footer Grid */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-4">
          
          {/* Follow Us */}
          <FooterColumn title="Follow Us">
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </Link>
                )
              })}
            </div>
          </FooterColumn>

          {/* Browse */}
          <FooterColumn title="Browse">
            {browseLinks.map((link) => (
              <FooterLink key={link.label} href={link.href} label={link.label} />
            ))}
          </FooterColumn>

          {/* Support */}
          <FooterColumn title="Support">
            {supportLinks.map((link) => (
              <FooterLink key={link.label} href={link.href} label={link.label} />
            ))}
          </FooterColumn>

          {/* Back to Top */}
          <div className="flex items-start justify-start md:justify-end">
            <button
              onClick={scrollToTop}
              className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-200"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Gamer Bhidu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
