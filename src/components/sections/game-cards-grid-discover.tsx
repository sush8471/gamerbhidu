"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getGamesBySection } from "@/lib/local-db";
import { SectionHeader } from "@/components/ui/section-header";
import { CarouselNav } from "@/components/ui/carousel-nav";
import GameCardRowSkeleton from "@/components/ui/game-card-row-skeleton";
import { WishlistButton } from "@/components/ui/wishlist-button";
import { useStorefrontSync } from "@/hooks/use-storefront-sync";
const SECTION_TABLES = ["section_games", "games", "homepage_sections"];


type Game = {
  id: string;
  title: string;
  slug: string;
  image_url: string;
  price: number | string;
  original_price?: number | null;
  discount_percentage?: number | null;
};

export default function GameCardsGridDiscover() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGames = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const { data } = await getGamesBySection("hot-deals");
      if (data) setGames(data);
    } catch (err) {
      console.error("Failed to load hot deals:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGames(true);
  }, [loadGames]);

  useStorefrontSync(() => loadGames(false), { tables: SECTION_TABLES });

  if (loading) {
    return (
      <GameCardRowSkeleton
        title="Hot Deals"
        subtitle="Premium games at India's best prices"
        count={6}
      />
    );
  }

  if (games.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-background py-12 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-4 lg:mb-6">
          <SectionHeader
            title="Hot Deals"
            subtitle="Premium games at India's best prices"
          />

          <CarouselNav scrollRef={scrollContainerRef} itemCount={games.length} />
        </div>

        <div ref={scrollContainerRef} className="overflow-x-auto flex gap-3 pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6 lg:mx-0 lg:px-0">
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
                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
                        -{game.discount_percentage}%
                      </div>
                    )}
                    {/* Wishlist heart */}
                    <div className="absolute top-2 left-2">
                      <WishlistButton
                        item={{
                          gameId: game.slug,
                          gameName: game.title,
                          image: game.image_url,
                          price: Number(game.price),
                        }}
                        size="sm"
                      />
                    </div>
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