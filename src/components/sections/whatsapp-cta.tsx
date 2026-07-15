"use client";

import { MessageCircle, ArrowRight } from "lucide-react";

interface WhatsAppCTAProps {
  variant?: "primary" | "secondary";
  title?: string;
  description?: string;
}

export default function WhatsAppCTA({
  variant = "primary",
  title = "Ready to Buy?",
  description = "Chat with us on WhatsApp for instant support and game delivery",
}: WhatsAppCTAProps) {
  if (variant === "secondary") {
      return (
        <section className="w-full bg-background py-4 md:py-8">
          <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
            <div className="relative bg-card rounded-lg md:rounded-2xl p-3 md:p-6 lg:p-8 border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#25D366]/5 to-white/5 opacity-50" />

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-base md:text-2xl lg:text-3xl font-bold text-white">{title}</h3>
                </div>

                <div className="flex flex-col items-center md:items-end gap-1.5 md:gap-2 flex-shrink-0">
                  <button
                    className="group bg-gradient-to-r from-[#25D366] to-[#1DA851] hover:from-[#1DA851] hover:to-[#25D366] text-white font-bold text-xs md:text-base lg:text-lg px-4 md:px-8 lg:px-10 py-2 md:py-3.5 lg:py-4 rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(37,211,102,0.3)] flex items-center gap-1.5 md:gap-3"
                    onClick={() => window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: "https://wa.me/917752805529" } }, "*")}
                  >
                    <MessageCircle className="w-3.5 h-3.5 md:w-5 md:h-5 lg:w-6 lg:h-6" strokeWidth={2.5} />
                    Chat Now
                    <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                  </button>
                  <p className="text-muted-foreground text-xs md:text-xs">We usually reply in minutes</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
  }

  return (
    <section className="w-full bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8">
        <div className="relative bg-card rounded-2xl p-8 lg:p-14 overflow-hidden border border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/5 via-transparent to-white/5 opacity-40" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 backdrop-blur-sm mb-6">
              <MessageCircle className="w-8 h-8 lg:w-10 lg:h-10 text-[#25D366]" strokeWidth={2} />
            </div>

            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-3 lg:mb-4">{title}</h2>

            <p className="text-muted-foreground text-sm lg:text-lg max-w-2xl mx-auto mb-8 lg:mb-10 leading-relaxed">{description}</p>

            <button
              className="group bg-gradient-to-r from-[#25D366] to-[#1DA851] hover:from-[#1DA851] hover:to-[#25D366] text-white font-semibold text-base lg:text-lg px-10 lg:px-12 py-3.5 lg:py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-[0_8px_30px_rgba(37,211,102,0.25)] flex items-center gap-3 mx-auto"
              onClick={() => window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: "https://wa.me/917752805529" } }, "*")}
            >
              <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2.5} />
              Open WhatsApp
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </button>

            <p className="text-muted-foreground text-xs lg:text-sm mt-4">We usually reply in minutes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
