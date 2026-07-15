"use client";

import { ShoppingCart, MessageCircle, Download } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

export default function HowItWorks() {
  const steps = [
    {
      icon: ShoppingCart,
      number: "1",
      title: "Browse & Add to Cart",
      description: "Select games and add them to your cart",
      iconColor: "text-white/60",
    },
    {
      icon: MessageCircle,
      number: "2",
      title: "Checkout on WhatsApp",
      description: "Complete payment via WhatsApp",
      iconColor: "text-[#25D366]",
    },
    {
      icon: Download,
      number: "3",
      title: "Get Game Instantly",
      description: "Receive activation details immediately",
      iconColor: "text-white/60",
    },
  ];

    return (
      <section className="w-full bg-background py-12 md:py-16">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        
        <SectionHeader
          title="How It Works"
          subtitle="Three simple steps to start gaming"
          align="center"
          className="mb-4 md:mb-8"
        />

        <div className="md:hidden space-y-3 max-w-md mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            return (
              <div key={index} className="flex items-start gap-3 relative">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-xs">
                    {step.number}
                  </div>
                  {!isLast && (
                    <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent mt-1"></div>
                  )}
                </div>
                
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon className={`w-4 h-4 ${step.iconColor}`} strokeWidth={2} />
                    <h3 className="text-sm font-semibold text-white leading-tight">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="bg-card/50 rounded-lg p-4 border border-white/10"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-lg bg-card flex items-center justify-center border border-white/5`}>
                      <Icon className={`w-6 h-6 ${step.iconColor}`} strokeWidth={2} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-base lg:text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-xs lg:text-sm leading-snug">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}