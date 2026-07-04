"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQCategory = "All" | "Purchase" | "Safety" | "Support" | "Pricing";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>("All");

    const faqs = [
      {
        question: "What exactly do I receive after purchasing a game?",
        answer: "After purchase, you receive original portable Steam game files along with a step-by-step video tutorial. These files are used to add the game to your own Steam library by following simple instructions.",
        category: "Purchase" as FAQCategory
      },
      {
        question: "Are these games genuine and safe?",
        answer: "Yes. All games are 100% original and genuine. There is no malware, no virus, and no pirated or cracked content. The games appear directly in your personal Steam library.",
        category: "Safety" as FAQCategory
      },
      {
        question: "How do I add the game to my Steam account?",
        answer: "The process is straightforward. You'll receive a video guide showing exactly how to complete the game addition using the provided files. You follow the steps at your own pace.",
        category: "Purchase" as FAQCategory
      },
      {
        question: "What if I face any issues after purchase?",
        answer: "Full post-purchase support via WhatsApp is provided. If you face any issue during or after the process, support is available to help resolve it.",
        category: "Support" as FAQCategory
      },
      {
        question: "Why is the delivery process done this way?",
        answer: "Manual delivery allows better support, faster issue resolution, and significantly lower operating costs, which helps keep prices affordable for Indian gamers.",
        category: "Purchase" as FAQCategory
      },
      {
        question: "Why are your game prices lower than other platforms?",
        answer: "Prices are lower because there are no marketplace fees, delivery is handled manually via WhatsApp, and pricing is India-focused rather than global retail pricing. These savings are passed directly to customers.",
        category: "Pricing" as FAQCategory
      },
      {
        question: "Do you sell cracked or pirated games?",
        answer: "No. We do not sell cracked or pirated games. All games provided are original and genuine.",
        category: "Safety" as FAQCategory
      },
      {
        question: "Is this process safe for my Steam account?",
        answer: "Yes. The process is manual and transparent, and games are added to your own Steam library by following provided instructions. No malware, viruses, or harmful software is involved.",
        category: "Safety" as FAQCategory
      },
      {
        question: "Are you affiliated with Steam or Valve?",
        answer: "No. Steam is a registered trademark of Valve Corporation. This website is not affiliated with or endorsed by Valve.",
        category: "Safety" as FAQCategory
      }
    ];

    const categories: FAQCategory[] = ["All", "Purchase", "Safety", "Support", "Pricing"];
    
    const filteredFaqs = selectedCategory === "All" 
      ? faqs 
      : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

    return (
      <section className="w-full bg-[#080A10] py-8 md:py-12 lg:py-20">
        <div className="mx-auto max-w-[900px] px-4 md:px-6 lg:px-8">
          
          <div className="text-center mb-6 md:mb-10 lg:mb-14">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 lg:mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setOpenIndex(null);
                }}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white shadow-lg shadow-orange-500/20"
                    : "bg-[#121622] text-[#B0B8D0] hover:bg-[#202838] border border-[#202838]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="space-y-2 md:space-y-3 lg:space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gradient-to-b from-[#121622] to-[#141416] rounded-lg md:rounded-xl border border-[#202838] overflow-hidden transition-all duration-300 hover:border-[#202838]/80"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-3.5 md:p-5 lg:p-6 text-left transition-all duration-200"
                >
                  <span className="text-white font-semibold text-xs md:text-sm lg:text-base pr-3">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-[#B0B8D0] transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-3.5 md:px-5 lg:px-6 pb-3.5 md:pb-5 lg:pb-6 pt-0">
                    <p className="text-[#B0B8D0] text-xs md:text-sm lg:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    );
}
