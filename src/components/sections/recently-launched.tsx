"use client";

import { useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rocket, ChevronLeft, ChevronRight } from "lucide-react";
import { GAMES_DATABASE } from "@/data/games";

export default function RecentlyLaunched() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Recently Launched Games: Filter games in the "RECENTLY LAUNCHED" section
    const recentlyLaunchedGames = useMemo(() =>
        GAMES_DATABASE.filter(game =>
            ["reanimal", "nioh-3", "resident-evil-requiem", "ride-6"].includes(game.id)
        ),
        []
    );

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

    if (recentlyLaunchedGames.length === 0) {
        return null; // Don't render section if no games
    }

    return (
        <section className="w-full bg-[#080A10] py-8 lg:py-12">
            <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">

                <div className="flex items-center justify-between gap-4 mb-4 lg:mb-6">
                    <div>
                        <h2 className="text-2xl lg:text-4xl font-black text-white mb-1 flex items-center gap-2">
                            <Rocket className="w-6 h-6 lg:w-8 lg:h-8 text-[#00D2FF]" />
                            Recently Launched
                        </h2>
                        <p className="text-[#B0B8D0] text-sm lg:text-base">
                            Fresh arrivals - Get them now!
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    {recentlyLaunchedGames.length > 6 && (
                        <div className="hidden lg:flex items-center gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="p-2 rounded-lg bg-[#121622] hover:bg-[#202838] border border-[#202838] hover:border-[#00D2FF]/30 text-white transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,210,255,0.2)]"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="p-2 rounded-lg bg-[#121622] hover:bg-[#202838] border border-[#202838] hover:border-[#00D2FF]/30 text-white transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,210,255,0.2)]"
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div ref={scrollContainerRef} className="overflow-x-auto flex gap-3 pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                    {recentlyLaunchedGames.map((game) => {
                        // Calculate discount percentage
                        const discount = (game.originalPrice && typeof game.price === 'number')
                            ? Math.round(((game.originalPrice - game.price) / game.originalPrice) * 100)
                            : 0;

                        return (
                            <Link
                                key={game.id}
                                href={`/games/${game.id}`}
                                className="flex-shrink-0 snap-start"
                            >
                                <div className="group relative bg-[#121622] rounded-lg overflow-hidden border border-[#202838] hover:border-[#00D2FF]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,210,255,0.15)] flex-shrink-0 w-[60vw] max-w-[240px] h-full cursor-pointer">
                                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                                        <Image
                                            src={game.image}
                                            alt={game.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 768px) 70vw, 16vw"
                                        />

                                        {/* NEW Badge */}
                                        <div className="absolute top-2 left-2 bg-gradient-to-r from-[#00D2FF] to-[#00CC6E] text-[#080A10] text-xs font-bold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
                                            <Rocket className="w-3 h-3" />
                                            NEW
                                        </div>

                                        {/* Discount Badge */}
                                        {discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg">
                                                -{discount}%
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-white font-black text-xl">
                                                ₹{game.price}
                                            </span>
                                            {game.originalPrice && typeof game.price === 'number' && (
                                                <span className="text-[#B0B8D0] text-xs line-through">
                                                    ₹{game.originalPrice}
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
