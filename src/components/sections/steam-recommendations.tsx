"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSteam } from "@/context/SteamContext";
import { getGames, type Game } from "@/lib/local-db";
import { SectionHeader } from "@/components/ui/section-header";
import { CarouselNav } from "@/components/ui/carousel-nav";
import { WishlistButton } from "@/components/ui/wishlist-button";
import { SteamOwnedBadge } from "@/components/ui/steam-owned-badge";
import { Sparkles, Gamepad2 } from "lucide-react";

export default function SteamRecommendations() {
  const { steamProfile, ownedAppIds, isGameOwned } = useSteam();
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function calculateRecommendations() {
      if (!steamProfile || ownedAppIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: allGames } = await getGames({ limit: 200 });

        if (!allGames || allGames.length === 0) {
          setLoading(false);
          return;
        }

        // 1. Identify owned games in our database
        const ownedGamesInDb = allGames.filter(
          (g) => g.steam_app_id && ownedAppIds.includes(g.steam_app_id)
        );

        // 2. Tally genres from user's owned games
        const genreCounts: Record<string, number> = {};
        ownedGamesInDb.forEach((g) => {
          (g.genre || []).forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        });

        // Get top 3 favorite genres (default to Action/RPG if no matching games in DB)
        const sortedGenres = Object.keys(genreCounts).sort(
          (a, b) => genreCounts[b] - genreCounts[a]
        );
        const topGenres = sortedGenres.slice(0, 3);
        setFavoriteGenres(topGenres);

        // 3. Filter catalog for games user DOES NOT own yet, matching top genres
        const unownedGames = allGames.filter(
          (g) => !g.steam_app_id || !ownedAppIds.includes(g.steam_app_id)
        );

        // Score unowned games by genre overlap
        const scoredGames = unownedGames
          .map((g) => {
            let score = 0;
            (g.genre || []).forEach((genre) => {
              if (topGenres.includes(genre)) {
                score += 2;
              }
            });
            return { game: g, score };
          })
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((item) => item.game);

        setRecommendedGames(scoredGames.slice(0, 8));
      } catch (err) {
        console.error("Failed to generate Steam recommendations:", err);
      } finally {
        setLoading(false);
      }
    }

    calculateRecommendations();
  }, [steamProfile, ownedAppIds]);

  if (!steamProfile || recommendedGames.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-background py-12 lg:py-16 border-t border-border/40">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
              <Gamepad2 className="w-4 h-4" />
              <span>STREAMPICK PERSONALIZED</span>
              {favoriteGenres.length > 0 && (
                <span className="text-muted-foreground font-normal">
                  • Based on your love for {favoriteGenres.join(", ")}
                </span>
              )}
            </div>
            <SectionHeader
              title={`Recommended for ${steamProfile.personaName}`}
              subtitle="Games from our catalog matching your Steam library taste"
            />
          </div>

          <CarouselNav scrollRef={scrollRef} itemCount={recommendedGames.length} />
        </div>

        <div
          ref={scrollRef}
          className="overflow-x-auto flex gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0"
        >
          {recommendedGames.map((game) => {
            const isOwned = isGameOwned(game.steam_app_id);
            const hasDiscount = !!game.discount_percentage;

            return (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="flex-shrink-0 snap-start hover:no-underline"
              >
                <div className="group relative bg-card border border-border/60 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 flex-shrink-0 w-[220px] sm:w-[240px] h-full cursor-pointer shadow-md">
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={game.image_url}
                      alt={game.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="240px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {hasDiscount && (
                      <div className="absolute top-2.5 right-2.5 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-md shadow">
                        -{game.discount_percentage}%
                      </div>
                    )}

                    {/* Steam Owned Badge overlay */}
                    {isOwned && (
                      <div className="absolute top-2.5 left-2.5">
                        <SteamOwnedBadge size="sm" />
                      </div>
                    )}

                    {!isOwned && (
                      <div className="absolute top-2.5 left-2.5">
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
                    )}
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <h3 className="text-white text-sm font-bold truncate group-hover:text-primary transition-colors">
                      {game.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {game.original_price && (
                        <span className="text-muted-foreground text-xs line-through">
                          ₹{game.original_price}
                        </span>
                      )}
                      <span className="text-white text-sm font-black">
                        ₹{game.price}
                      </span>
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
