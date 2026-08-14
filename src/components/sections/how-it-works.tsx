"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Browse & Add to Cart",
    description: "Select games and add them to your cart",
  },
  {
    number: "02",
    title: "Checkout on WhatsApp",
    description: "Complete payment via WhatsApp",
  },
  {
    number: "03",
    title: "Get Game Instantly",
    description: "Receive activation details immediately",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <SectionHeader
          title="How It Works"
          subtitle="Three simple steps to start gaming"
          className="mb-12 md:mb-16"
        />

        {/* Mobile Timeline */}
        <div className="md:hidden space-y-6 max-w-md mx-auto">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <div key={index} className="flex items-start gap-4 relative">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {step.number}
                  </div>
                  {!isLast && (
                    <div className="w-px h-full min-h-[40px] bg-gradient-to-b from-border via-border to-transparent mt-2" />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Connected Journey */}
        <div className="hidden md:block relative">
          {/* Connecting line behind cards */}
          <div className="absolute top-[52px] left-[16%] right-[16%] h-px bg-border" />
          <div className="absolute top-[52px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid grid-cols-3 gap-6 lg:gap-10">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative group"
                >
                  {/* Step marker on the connecting line */}
                  <div className="relative z-10 flex justify-center mb-8">
                    <div className="w-[104px] h-[104px] rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:shadow-glow-sm transition-all duration-300">
                      <span className="text-3xl font-black text-foreground/90 tracking-tighter group-hover:text-primary transition-colors duration-300">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Arrow between steps */}
                  {!isLast && (
                    <div className="absolute top-[42px] left-full -translate-x-1/2 z-20 text-primary/40 hidden lg:block">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M14 6l6 6-6 6" />
                      </svg>
                    </div>
                  )}

                  {/* Card */}
                  <div className="bg-card/40 rounded-xl p-6 border border-border group-hover:border-primary/20 group-hover:bg-card/60 transition-all duration-300 text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
