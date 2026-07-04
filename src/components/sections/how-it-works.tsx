"use client";

import { ShoppingCart, MessageCircle, Download } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: ShoppingCart,
      number: "1",
      title: "Browse & Add to Cart",
      description: "Select games and add them to your cart",
      iconColor: "text-[#3B82F6]",
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
      iconColor: "text-[#8B5CF6]",
    },
  ];

    return (
      <section className="w-full bg-[#080A10] py-12 md:py-16">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        
        <div className="text-center md:text-center mb-4 md:mb-8">
          <h2 className="text-xl md:text-3xl font-bold text-white">
            How It Works
          </h2>
        </div>

        <div className="md:hidden space-y-3 max-w-md mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            return (
              <div key={index} className="flex items-start gap-3 relative">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#0056B3] flex items-center justify-center text-white font-bold text-xs">
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
                  <p className="text-xs text-[#B0B8D0] leading-tight">
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
                className="bg-[#121622]/50 rounded-lg p-4 border border-[#202838]"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-lg bg-[#121622] flex items-center justify-center border border-white/5`}>
                      <Icon className={`w-6 h-6 ${step.iconColor}`} strokeWidth={2} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#0056B3] flex items-center justify-center text-white font-bold text-xs shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-base lg:text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  
                  <p className="text-[#B0B8D0] text-xs lg:text-sm leading-snug">
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