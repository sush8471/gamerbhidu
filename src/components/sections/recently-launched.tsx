"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rocket, ChevronLeft, ChevronRight } from "lucide-react";
import { getGamesBySection } from "@/lib/local-db";
import { SectionHeader } from "@/components/ui/section-header";

type Game = {
  id: string;
  title: string;
  slug: string;
  image_url: string;
  price: number | string;
  original_price?: number | null;
  discount_percentage?: number | null;
};

export default function RecentlyLaunched() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      try {
        const { data } = await getGamesBySection("recently-launched");
        if (data) {
          setGames(data);
        }
      } catch (err) {
        console.error("Failed to load recently launched:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollPosition = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  if (loading || games.length === 0) {
    return null; // Don't render while loading or if empty
  }

  return (
    <section className="w-full bg-background py-8 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-4 lg:mb-6">
          <SectionHeader
            title="Recently Launched"
            subtitle="Fresh arrivals - Get them now!"
            icon={<Rocket className="w-6 h-6 lg:w-8 lg:h-8" />}
          />

          {/* Navigation Buttons */}
          {games.length > 6 && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-lg bg-card hover:bg-surface-elevated border border-border hover:border-white/30 text-white transition-all duration-200 hover:shadow-[0_0_12px_rgba(255,255,255,0.10)] cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-lg bg-card hover:bg-surface-elevated border border-border hover:border-white/30 text-white transition-all duration-200 hover:shadow-[0_0_12px_rgba(255,255,255,0.10)] cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div ref={scrollContainerRef} className="overflow-x-auto flex gap-3 pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {games.map((game) => {
            const hasDiscount = !!game.discount_percentage;

            return (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="flex-shrink-0 snap-start hover:no-underline"
              >
                <div className="group relative bg-card rounded-lg overflow-hidden border-0 transition-all duration-300 hover:scale-[1.01] flex-shrink-0 w-[60vw] max-w-[240px] h-full cursor-pointer">
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={game.image_url}
                      alt={game.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 70vw, 16vw"
                    />

                    {/* NEW Badge */}
                    <div className="absolute top-2 left-2 bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg backdrop-blur-sm flex items-center gap-1">
                      <Rocket className="w-3 h-3" />
                      NEW
                    </div>

                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg backdrop-blur-sm">
                        -{game.discount_percentage}%
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-black text-xl">
                        ₹{game.price}
                      </span>
                      {game.original_price && (
                        <span className="text-muted-foreground text-xs line-through">
                          ₹{game.original_price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
