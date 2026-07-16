"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getGamesBySection } from "@/lib/local-db";
import { SectionHeader } from "@/components/ui/section-header";
import { CarouselNav } from "@/components/ui/carousel-nav";
import GameCardRowSkeleton from "@/components/ui/game-card-row-skeleton";

type Game = {
  id: string;
  title: string;
  slug: string;
  image_url: string;
  genre: string[];
};

export default function UpcomingGames() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      try {
        const { data } = await getGamesBySection("upcoming-games");
        if (data) {
          setGames(data);
        }
      } catch (err) {
        console.error("Failed to load upcoming games:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  if (loading) {
    return (
      <GameCardRowSkeleton
        title="Upcoming Games"
        subtitle="New releases arriving soon"
        count={6}
      />
    );
  }

  return (
    <section className="w-full bg-background py-8 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-4 lg:mb-6">
          <SectionHeader
            title="Upcoming Games"
            subtitle="New releases arriving soon"
          />

          <CarouselNav scrollRef={scrollContainerRef} itemCount={games.length} show={games.length > 1} />
        </div>

        <div ref={scrollContainerRef} className="overflow-x-auto flex gap-3 pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {games.length === 0 ? (
            // Empty state
            <div className="w-full text-center py-12">
              <p className="text-muted-foreground text-lg">No upcoming games at the moment</p>
              <p className="text-muted-foreground text-sm mt-2">Check back soon for new releases!</p>
            </div>
          ) : (
            games.map((game) => {
              const CardContent = (
                <div
                  className="group relative bg-card/40 rounded-lg overflow-hidden border-0 transition-all duration-300 hover:scale-[1.01] cursor-pointer flex-shrink-0 w-[60vw] max-w-[240px] snap-start h-full"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={game.image_url}
                      alt={game.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      sizes="(max-width: 768px) 60vw, 16vw"
                    />

                    <div className="absolute top-2 right-2 bg-white/15 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Coming Soon
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-bold truncate">{game.title}</p>
                      <p className="text-white/80 text-xs">{game.genre.join(', ')}</p>
                    </div>
                  </div>
                </div>
              );

              return (
                <Link key={game.id} href={`/games/${game.slug}`} className="flex-shrink-0 snap-start hover:no-underline">
                  {CardContent}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
