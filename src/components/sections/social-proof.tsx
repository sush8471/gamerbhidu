"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { GlareCard } from "@/components/ui/glare-card";

export default function SocialProof() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const proofImages = [
    {
      id: 1,
      src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123151-1765869145884.jpg?width=8000&height=8000&resize=contain",
      label: "3 Games Deal Delivered",
      tag: "Order Delivered",
    },
      {
        id: 2,
        src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123138-1765869145631.jpg?width=8000&height=8000&resize=contain",
        label: "Subnautica Deal Executed",
        tag: "Verified Deal",
      },
      {
        id: 3,
        src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123143-1765869145725.jpg?width=8000&height=8000&resize=contain",
        label: "Mortal Kombat 11 Deal Closed",
        tag: "Order Delivered",
      },
    {
      id: 4,
      src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123154-1765869145644.jpg?width=8000&height=8000&resize=contain",
      label: "Spiderman Miles Morales Deal",
      tag: "Order Delivered",
    },
    {
      id: 5,
      src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123149-1765869146049.jpg?width=8000&height=8000&resize=contain",
      label: "7 AAA Games Ultimate Deal",
      tag: "Verified Deal",
    },
    {
      id: 6,
      src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123226-1765869176515.jpg?width=8000&height=8000&resize=contain",
      label: "Mega Holi Deal 25 Games",
      tag: "Order Delivered",
    },
    {
      id: 7,
      src: "/proof-1.jpg",
      label: "Cyberpunk & Mafia Deal",
      tag: "Order Delivered",
    },
    {
      id: 8,
      src: "/proof-2.jpg",
      label: "Truck Simulator Bundle",
      tag: "Verified Deal",
    },
    {
      id: 9,
      src: "/proof-3.jpg",
      label: "5 AAA Games Package",
      tag: "Order Delivered",
    },
    {
      id: 10,
      src: "/proof-4.jpg",
      label: "Batman Arkham Origins",
      tag: "Verified Deal",
    },
    {
      id: 11,
      src: "/proof-5.jpg",
      label: "Red Dead Redemption 2",
      tag: "Order Delivered",
    },
    {
      id: 12,
      src: "/proof-7.jpg",
      label: "Last of Us Deal",
      tag: "Verified Deal",
    },
    {
      id: 13,
      src: "/proof-8.jpg",
      label: "God of War Ragnarok",
      tag: "Order Delivered",
    },
    {
      id: 14,
      src: "/proof-9.jpg",
      label: "RDR 2 Deal Completed",
      tag: "Verified Deal",
    },
    {
      id: 15,
      src: "/proof-10.jpg",
      label: "GOW Ragnarok Bundle",
      tag: "Order Delivered",
    },
    {
      id: 16,
      src: "/proof-11.jpg",
      label: "The Last Of Us Part 1",
      tag: "Verified Deal",
    },
    {
      id: 17,
      src: "/proof-12.jpg",
      label: "+4 Games Deal",
      tag: "Order Delivered",
    },
    {
      id: 18,
      src: "/proof-13.jpg",
      label: "+4 Premium Games",
      tag: "Verified Deal",
    },
    {
      id: 19,
      src: "/proof-14.jpg",
      label: "6 Games Deal",
      tag: "Order Delivered",
    },
    {
      id: 20,
      src: "/proof-15.jpg",
      label: "Red Dead Redemption 1",
      tag: "Verified Deal",
    },
    {
      id: 21,
      src: "/proof-16.jpg",
      label: "Cyberpunk 2077",
      tag: "Order Delivered",
    },
    {
      id: 22,
      src: "/proof-17.jpg",
      label: "Ghost Of Tsushima - 6 Games in 400",
      tag: "Epic Deal",
    },
    {
      id: 23,
      src: "/proof-18.jpg",
      label: "God Of War Ragnarok",
      tag: "Verified Deal",
    },
    {
      id: 24,
      src: "/proof-19.jpg",
      label: "God Of War",
      tag: "Order Delivered",
    },
    {
      id: 25,
      src: "/proof-20.jpg",
      label: "Mega Holi Deal 25 Games",
      tag: "Epic Deal",
    },
    {
      id: 26,
      src: "/proof-21.jpg",
      label: "Black Myth Wukong",
      tag: "Verified Deal",
    },
    {
      id: 27,
      src: "/proof-22.jpg",
      label: "Mega Holi Deal",
      tag: "Order Delivered",
    },
  ];

  return (
    <>
      <section className="w-full bg-gradient-to-b from-[#080A10] to-[#0E111C] py-16 lg:py-20">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10 lg:mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-3 lg:mb-4">
              Trusted by Indian Gamers
            </h2>
            <p className="text-[#B0B8D0] text-base lg:text-lg max-w-2xl mx-auto">
              Real payment proofs from customers who bought Steam games via WhatsApp & UPI.
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {proofImages.map((proof) => (
                <button
                  key={proof.id}
                  onClick={() => setSelectedImage(proof.src)}
                  className="flex-shrink-0 snap-center focus:outline-none relative"
                >
                  <GlareCard className="flex flex-col items-center justify-center bg-[#151932] relative">
                      <Image
                        src={proof.src}
                        alt={proof.label}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, 260px"
                      />
                    <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                      {proof.tag}
                    </div>
                  </GlareCard>
                </button>
              ))}
            </div>

            <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-[#0E111C] to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-[#0E111C] to-transparent pointer-events-none"></div>
          </div>

          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative max-w-[95vw] max-h-[95vh] animate-scale-in">
            <Image
              src={selectedImage}
              alt="Payment proof full view"
              width={1200}
              height={2133}
              className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes scale-in {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.2s ease-out;
            }
            .animate-scale-in {
              animation: scale-in 0.3s ease-out;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
