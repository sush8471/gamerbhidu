"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";

interface ComboData {
  id: number;
  title: string;
  description: string;
  valueAnchor: string;
  curiosityCue: string;
  price: {
    original?: string;
    discounted: string;
    discountDetails?: string;
  };
  image: string;
  hasGameList?: boolean;
}

const LOW_SPEC_GAMES = [
  "Prototype 1",
  "Prototype 2",
  "GTA: San Andreas",
  "GTA: Vice City",
  "GTA III",
  "Max Payne",
  "Max Payne 2",
  "Prince of Persia: Sands of Time",
  "Prince of Persia: Warrior Within",
  "Prince of Persia: Two Thrones",
  "Tomb Raider (2013)",
  "Assassin's Creed II",
  "Assassin's Creed Brotherhood",
  "Assassin's Creed Revelations",
  "Bully: Scholarship Edition",
  "Mafia (Classic)",
  "Mafia II",
  "Call of Duty 4: Modern Warfare",
  "Call of Duty: World at War",
  "Call of Duty: Modern Warfare 2 (2009)",
  "Call of Duty: Modern Warfare 3",
  "Call of Duty: Black Ops 1",
  "Call of Duty: Black Ops 2",
  "Left 4 Dead",
  "Left 4 Dead 2",
  "Far Cry 2",
  "Far Cry 3",
  "Need for Speed: Most Wanted (2005)",
  "Need for Speed: Carbon",
  "Need for Speed: Underground",
  "Need for Speed: Underground 2",
  "Burnout Paradise",
  "Age of Empires II (HD Edition)",
  "Plants vs Zombies",
];

const STORY_LOVER_GAMES = [
  "The Last of Us Part I",
  "The Last of Us Part II",
  "God of War",
  "God of War Ragnarök",
  "Red Dead Redemption 2",
  "Detroit: Become Human",
  "Uncharted: Legacy of Thieves Collection",
  "A Plague Tale: Innocence",
  "A Plague Tale: Requiem",
  "Disco Elysium",
  "Mafia: Definitive Edition",
  "Cyberpunk 2077",
  "Star Wars Jedi: Fallen Order",
  "Little Nightmares",
  "Little Nightmares II",
];

const OPEN_WORLD_GAMES = [
  "Grand Theft Auto V",
  "Red Dead Redemption 2",
  "Elden Ring",
  "Ghost of Tsushima",
  "Assassin's Creed Valhalla",
  "Hogwarts Legacy",
  "Horizon Zero Dawn",
  "Far Cry 5",
  "Forza Horizon 5",
  "The Witcher 3: Wild Hunt",
];

const COMBOS: ComboData[] = [
  {
    id: 1,
    title: "Low-Spec PC Bundle",
    description: "Runs smooth on older hardware",
    valueAnchor: "Worth ₹1,799 → Get for ₹199",
    curiosityCue: "33 classic games included",
    price: {
      discounted: "₹199",
    },
    image: "/low-spec-bundle.jpg",
    hasGameList: true,
  },
  {
    id: 2,
    title: "Story-Lover Pack",
    description: "Perfect if you loved The Last of Us",
    valueAnchor: "Worth ₹3,774 → Get for ₹499",
    curiosityCue: "15 narrative masterpieces included",
    price: {
      original: "₹3,774",
      discounted: "₹499",
      discountDetails: "-87%",
    },
    image: "/story-lover-pack.jpg",
    hasGameList: true,
  },
  {
    id: 3,
    title: "Open-World Addict",
    description: "Explore massive worlds, your way",
    valueAnchor: "Worth ₹3,176 → Get for ₹699",
    curiosityCue: "10 massive open-world games",
    price: {
      original: "₹3,176",
      discounted: "₹699",
      discountDetails: "-78%",
    },
    image: "/open-world-addict.jpg",
    hasGameList: true,
  },
];

function GameListDialog({ 
  isOpen, 
  onClose, 
  bundle 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  bundle: ComboData | null;
}) {
  if (!isOpen || !bundle) return null;

  const getGameList = (bundleId: number) => {
    if (bundleId === 1) return LOW_SPEC_GAMES;
    if (bundleId === 2) return STORY_LOVER_GAMES;
    if (bundleId === 3) return OPEN_WORLD_GAMES;
    return [];
  };

  const getBundleIcon = (bundleId: number) => {
    return "";
  };

  const getBundleSubtitle = (bundleId: number) => {
    if (bundleId === 1) return "Classic Games • Perfect for Older Hardware";
    if (bundleId === 2) return "Narrative Masterpieces • Emotional Storytelling";
    if (bundleId === 3) return "Massive Open Worlds • Endless Exploration";
    return "";
  };

  const games = getGameList(bundle.id);
  const gameCount = games.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-card rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-card to-card/95 backdrop-blur-sm border-b border-white/10 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">
                {bundle.title}
              </h2>
              <p className="text-muted-foreground text-sm">
                {gameCount} {getBundleSubtitle(bundle.id)}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
                <span className="text-white font-black text-lg">{bundle.price.discounted}</span>
                <span className="text-muted-foreground text-xs">Only</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-background border border-border hover:border-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Game List */}
        <div className="overflow-y-auto max-h-[calc(85vh-220px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {games.map((game, index) => {
              const isGTAV = game === "Grand Theft Auto V";
              const Content = (
                <>
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                    {isGTAV ? (
                      <ExternalLink className="w-3 h-3 text-white/60" />
                    ) : (
                      <Check className="w-3 h-3 text-white/60" />
                    )}
                  </div>
                  <span className="text-muted-foreground text-sm group-hover:text-white transition-colors">
                    {game}
                  </span>
                </>
              );

              if (isGTAV) {
                return (
                  <Link
                    key={index}
                    href="/games/gta-v"
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-white/5 hover:border-white/10 hover:bg-card transition-all duration-200 group cursor-pointer"
                  >
                    {Content}
                  </Link>
                );
              }

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-white/5 transition-all duration-200 group"
                >
                  {Content}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-card to-card/95 backdrop-blur-sm border-t border-white/10 p-6">
          <button
            onClick={() => {
              window.parent.postMessage(
                {
                  type: "OPEN_EXTERNAL_URL",
                  data: { url: `https://wa.me/917752805529?text=I want to buy the ${bundle.title} (${gameCount} games for ${bundle.price.discounted})` },
                },
                "*"
              );
            }}
            className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
          >
            <span>Buy on WhatsApp for {bundle.price.discounted}</span>
          </button>
          <p className="text-center text-muted-foreground text-xs mt-3">
            Instant delivery • Original Steam games • 24/7 support
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ComboDealSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<ComboData | null>(null);

  const handleComboClick = (combo: ComboData) => {
    if (combo.hasGameList) {
      setSelectedBundle(combo);
      setIsDialogOpen(true);
    } else {
      window.parent.postMessage(
        { type: "OPEN_EXTERNAL_URL", data: { url: "https://wa.me/917752805529" } },
        "*"
      );
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedBundle(null);
  };

  return (
    <>
      <section className="w-full bg-background py-12 lg:py-16">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-4 lg:mb-6">
          <SectionHeader
            title="Value Combos"
            subtitle="Multiple games at unbeatable prices"
          />
          <div className="hidden md:block text-muted-foreground text-sm">Swipe →</div>
        </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-4 overflow-x-auto flex gap-3 pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {COMBOS.map((combo) => (
              <button
                key={combo.id}
                onClick={() => handleComboClick(combo)}
                className="group relative bg-card rounded-lg overflow-hidden border-0 transition-all duration-300 hover:scale-[1.01] text-left flex-shrink-0 w-[85vw] max-w-[380px] lg:w-full snap-start"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={combo.image}
                    alt={combo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 85vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />

                  {combo.price.discountDetails && (
                    <div className="absolute top-2 right-2 bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
                      {combo.price.discountDetails}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-1.5 transition-colors">
                    {combo.title}
                  </h3>

                  <p className="text-muted-foreground text-xs mb-2">{combo.description}</p>

                  <p className="text-muted-foreground text-xs mb-1.5">{combo.valueAnchor}</p>

                  <p className="text-white/60 text-xs font-medium mb-3">{combo.curiosityCue}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {combo.price.original && (
                        <span className="text-muted-foreground line-through text-xs">
                          {combo.price.original}
                        </span>
                      )}
                      <span className="text-white font-black text-xl">{combo.price.discounted}</span>
                    </div>

                    <span className="text-white/60 text-xs font-semibold">
                      {combo.hasGameList ? "View Games" : "Ask on WhatsApp"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <GameListDialog isOpen={isDialogOpen} onClose={handleCloseDialog} bundle={selectedBundle} />
    </>
  );
}
