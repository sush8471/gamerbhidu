"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Check, ExternalLink, Clock, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { getCombos, Combo, ComboGame } from "@/lib/local-db";
import { SectionHeader } from "@/components/ui/section-header";
import { CarouselNav } from "@/components/ui/carousel-nav";
import ComboDealSkeleton from "@/components/ui/combo-deal-skeleton";
import { useCountdown } from "@/hooks/use-countdown";
import { CheckoutModal } from "@/components/ui/checkout-modal";
import { useAuth } from "@/context/AuthContext";

import { useSteam } from "@/context/SteamContext";

interface ComboData {
  id: string;
  title: string;
  description: string | null;
  valueAnchor: string | null;
  curiosityCue: string | null;
  price: {
    original?: string;
    discounted: string;
    discountDetails?: string;
  };
  image: string;
  hasGameList: boolean;
  dealExpiresAt: string | null;
  games?: ComboGame[];
}

function transformCombo(combo: Combo): ComboData {
  const originalPrice = combo.original_price ? `₹${combo.original_price.toLocaleString()}` : undefined;
  const discountedPrice = `₹${combo.discounted_price.toLocaleString()}`;
  
  return {
    id: combo.id,
    title: combo.title,
    description: combo.description,
    valueAnchor: combo.value_anchor,
    curiosityCue: combo.curiosity_cue,
    price: {
      original: originalPrice,
      discounted: discountedPrice,
      discountDetails: combo.discount_details ?? undefined,
    },
    image: combo.image_url || "",
    hasGameList: (combo.games?.length || 0) > 0,
    dealExpiresAt: combo.deal_expires_at,
    games: combo.games,
  };
}

function GameListDialog({ 
  isOpen, 
  onClose, 
  bundle,
  onProceedToCheckout,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  bundle: ComboData | null;
  onProceedToCheckout: (bundle: ComboData) => void;
}) {
  const [showAll, setShowAll] = useState(false);

  if (!isOpen || !bundle) return null;

  const games = bundle.games || [];
  const gameCount = games.length;
  const INITIAL_COUNT = 8;
  const visibleGames = showAll ? games : games.slice(0, INITIAL_COUNT);
  const hasMore = games.length > INITIAL_COUNT;

  const handleClose = () => {
    setShowAll(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[80vh] bg-card rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black text-white leading-snug truncate">
                {bundle.title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-muted-foreground text-[11px]">{gameCount} games</span>
                <span className="text-muted-foreground text-[11px]">•</span>
                <span className="text-white font-bold text-sm">{bundle.price.discounted}</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-background border border-border hover:border-white/30 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Game List - scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          <div className="grid grid-cols-1 gap-1.5">
            {visibleGames.map((gameItem, index) => {
              const game = gameItem.game;
              const isGTAV = game?.title === "Grand Theft Auto V";
              const Content = (
                <>
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                    {isGTAV ? (
                      <ExternalLink className="w-3 h-3 text-white/60" />
                    ) : (
                      <Check className="w-3 h-3 text-white/60" />
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs group-hover:text-white transition-colors truncate">
                    {game?.title || "Unknown Game"}
                  </span>
                </>
              );

              if (isGTAV && game?.slug) {
                return (
                  <Link
                    key={index}
                    href={`/games/${game.slug}`}
                    onClick={handleClose}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background/50 border border-white/5 hover:border-white/10 hover:bg-card transition-all duration-200 group cursor-pointer"
                  >
                    {Content}
                  </Link>
                );
              }

              return (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background/50 border border-white/5 transition-all duration-200 group"
                >
                  {Content}
                </div>
              );
            })}
          </div>

          {/* Show More / Show Less */}
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-3 flex items-center justify-center gap-1 py-1 text-muted-foreground hover:text-white transition-colors text-xs font-medium cursor-pointer"
            >
              {showAll ? "Show Less" : `Show All ${gameCount} Games`}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gradient-to-t from-card to-card/95 backdrop-blur-sm border-t border-white/10 p-4">
          <button
            onClick={() => onProceedToCheckout(bundle)}
            className="w-full bg-white/10 hover:bg-white text-white hover:text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
          >
            <span className="text-sm">Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-muted-foreground text-[10px] mt-2">
            Instant delivery • Original Steam games • 24/7 support
          </p>
        </div>
      </div>
    </div>
  );
}

function CountdownBadge({ expiresAt }: { expiresAt: string | null }) {
  const { remaining, expired } = useCountdown(expiresAt);

  if (!expiresAt || !remaining) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-white/10 rounded-md px-2.5 py-1.5 shadow-lg">
      <Clock className="w-3 h-3 text-red-400 shrink-0" />
      <span className="text-white text-[11px] font-bold tracking-wider tabular-nums">
        {remaining.days > 0 && `${remaining.days}d `}
        {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
      </span>
    </div>
  );
}

export default function ComboDealSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [combos, setCombos] = useState<ComboData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<ComboData | null>(null);
  const { ownedAppIds } = useSteam();
  const { user } = useAuth();

  const [comboCheckoutOpen, setComboCheckoutOpen] = useState(false);
  const [comboCheckoutName, setComboCheckoutName] = useState("");
  const [comboCheckoutEmail, setComboCheckoutEmail] = useState("");
  const [checkoutBundle, setCheckoutBundle] = useState<ComboData | null>(null);

  const loadCombos = useCallback(async () => {
    try {
      const { data, error: fetchError } = await getCombos();
      if (fetchError) throw new Error(fetchError);
      if (data && data.length > 0) {
        setCombos(data.map(transformCombo));
      } else {
        setError("No combos found");
      }
    } catch (err: any) {
      console.error("Failed to load combos:", err);
      setError(err?.message || "Failed to load combos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCombos();
  }, [loadCombos]);

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

  useEffect(() => {
    if (!isDialogOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isDialogOpen]);

  useEffect(() => {
    if (!comboCheckoutOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [comboCheckoutOpen]);

  const handleProceedToCheckout = (bundle: ComboData) => {
    setIsDialogOpen(false);
    setSelectedBundle(null);
    setCheckoutBundle(bundle);
    setComboCheckoutName(user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "");
    setComboCheckoutEmail(user?.email ?? "");
    setComboCheckoutOpen(true);
  };

  const buildComboWhatsAppMessage = useCallback(() => {
    if (!checkoutBundle) return "";
    const gameNames = (checkoutBundle.games || []).map((g, i) => `${i + 1}. ${g.game?.title || "Unknown Game"}`);
    return [
      `🎮 *Gamer Bhidu - Combo Purchase*`,
      "",
      comboCheckoutName ? `👤 *Customer:* ${comboCheckoutName}` : null,
      comboCheckoutEmail ? `📧 *Email:* ${comboCheckoutEmail}` : null,
      "",
      `📦 *Combo:* ${checkoutBundle.title} (${gameNames.length} games)`,
      ...gameNames,
      "",
      `💰 *Total Paid:* ${checkoutBundle.price.discounted}`,
      "",
      "I have completed the UPI payment. Please verify and confirm!",
    ].filter((l) => l !== null).join("\n");
  }, [checkoutBundle, comboCheckoutName, comboCheckoutEmail]);

  const buildComboCopyMessage = useCallback(() => {
    if (!checkoutBundle) return "";
    const gameNames = (checkoutBundle.games || []).map((g, i) => `${i + 1}. ${g.game?.title || "Unknown Game"}`);
    return [
      `Gamer Bhidu - Combo Order`,
      "",
      comboCheckoutName ? `Name: ${comboCheckoutName}` : null,
      comboCheckoutEmail ? `Email: ${comboCheckoutEmail}` : null,
      "",
      `Combo: ${checkoutBundle.title} (${gameNames.length} games)`,
      ...gameNames,
      "",
      `Total: ${checkoutBundle.price.discounted}`,
    ].filter((l) => l !== null).join("\n");
  }, [checkoutBundle, comboCheckoutName, comboCheckoutEmail]);

  // Show loading state
  if (loading) {
    return <ComboDealSkeleton />;
  }

  // Show empty state if no combos or error
  if (combos.length === 0) {
    return (
      <section className="w-full bg-background py-12 lg:py-16">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-4 lg:mb-6">
            <SectionHeader
              title="Value Combos"
              subtitle="Multiple games at unbeatable prices"
            />
          </div>
          <section className="text-center py-12 text-muted-foreground">
            <p className="font-medium">No combo deals available right now.</p>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </section>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full bg-background py-12 lg:py-16">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-4 lg:mb-6">
            <SectionHeader
              title="Value Combos"
              subtitle="Multiple games at unbeatable prices"
            />
            <CarouselNav scrollRef={scrollContainerRef} itemCount={combos.length} show={combos.length > 1} />
          </div>

          <div 
            ref={scrollContainerRef} 
            className="lg:grid lg:grid-cols-3 lg:gap-4 overflow-x-auto flex gap-3 pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0"
          >
            {combos.map((combo) => {
              const ownedInBundle = (combo.games || []).filter(
                (g) => g.game?.steam_app_id && ownedAppIds.includes(g.game.steam_app_id)
              ).length;

              return (
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

                    <CountdownBadge expiresAt={combo.dealExpiresAt} />

                    {ownedInBundle > 0 && (
                      <div className="absolute top-2 left-2 bg-sky-950/90 border border-sky-500/50 text-sky-300 text-[11px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm shadow flex items-center gap-1">
                        🎮 You own {ownedInBundle} game{ownedInBundle > 1 ? "s" : ""} on Steam
                      </div>
                    )}

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
              );
            })}

          </div>
        </div>
      </section>

      <GameListDialog isOpen={isDialogOpen} onClose={handleCloseDialog} bundle={selectedBundle} onProceedToCheckout={handleProceedToCheckout} />

      {checkoutBundle && (
        <CheckoutModal
          open={comboCheckoutOpen}
          onClose={() => { setComboCheckoutOpen(false); setCheckoutBundle(null); }}
          items={(checkoutBundle.games || []).map((g, i) => ({
            id: g.game_id,
            name: g.game?.title || "Unknown Game",
            price: 0,
            image: g.game?.image_url || "",
          }))}
          totalPrice={parseInt(checkoutBundle.price.discounted.replace(/[₹,]/g, "")) || 0}
          userName={comboCheckoutName || undefined}
          userEmail={comboCheckoutEmail || undefined}
          whatsappMessageBuilder={buildComboWhatsAppMessage}
          copyMessageBuilder={buildComboCopyMessage}
        />
      )}
    </>
  );
}