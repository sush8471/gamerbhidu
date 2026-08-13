"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp, Layers, X } from "lucide-react";
import type { ComboGame } from "@/lib/local-db";

export interface ComboGameListBundle {
  title: string;
  price: {
    discounted: string;
    original?: string;
  };
  games?: ComboGame[];
}

interface ComboGameListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: ComboGameListBundle | null;
  onProceedToCheckout: (bundle: ComboGameListBundle) => void;
}

const INITIAL_COUNT = 8;

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function ComboGameListDialog({
  isOpen,
  onClose,
  bundle,
  onProceedToCheckout,
}: ComboGameListDialogProps) {
  const [showAll, setShowAll] = useState(false);

  // Reset expansion state each time dialog opens a new bundle
  useEffect(() => {
    if (isOpen) setShowAll(false);
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const games = bundle?.games || [];
  const gameCount = games.length;
  const hasMore = gameCount > INITIAL_COUNT;
  const hiddenCount = gameCount - INITIAL_COUNT;
  const visibleGames = showAll ? games : games.slice(0, INITIAL_COUNT);

  return (
    <AnimatePresence>
      {isOpen && bundle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full sm:max-w-lg bg-card border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              showAll ? "max-h-[90vh]" : "max-h-[92vh]"
            }`}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h2 className="text-base font-black text-white leading-snug truncate">
                      {bundle.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[11px] text-muted-foreground font-semibold">
                      <Layers className="w-3 h-3" />
                      {gameCount} {gameCount === 1 ? "game" : "games"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {bundle.price.original && (
                        <span className="text-muted-foreground line-through text-xs">
                          {bundle.price.original}
                        </span>
                      )}
                      <span className="text-emerald-400 font-black text-sm">
                        {bundle.price.discounted}
                      </span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-background border border-border hover:border-white/30 hover:text-white text-muted-foreground transition-colors flex-shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Game grid - scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-5 py-4">
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.04 } } }}
                className="grid grid-cols-3 gap-3"
              >
                <AnimatePresence initial={false}>
                  {visibleGames.map((gameItem, index) => {
                    const game = gameItem.game;
                    const title = game?.title || "Unknown Game";
                    const slug = game?.slug;
                    const imageUrl = game?.image_url;

                    const card = (
                      <motion.div
                        layout
                        key={`${index}-${title}`}
                        variants={cardVariants}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-900 border border-white/5 shadow-lg cursor-pointer hover:border-emerald-500/40 hover:shadow-emerald-500/10 hover:shadow-xl"
                      >
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            sizes="(max-width: 640px) 30vw, 160px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-3">
                            <span className="text-muted-foreground text-[11px] text-center line-clamp-3">
                              {title}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
                        <span className="absolute bottom-0 left-0 right-0 p-2.5 text-white text-[11px] font-bold leading-snug line-clamp-2">
                          {title}
                        </span>
                      </motion.div>
                    );

                    return slug ? (
                      <Link
                        key={`${index}-${title}`}
                        href={`/games/${slug}`}
                        onClick={onClose}
                      >
                        {card}
                      </Link>
                    ) : (
                      <div key={`${index}-${title}`}>{card}</div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {/* Show More / Show Less */}
              {hasMore && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 text-white/70 hover:text-white transition-colors text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg cursor-pointer"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show All Games ({hiddenCount} more)
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gradient-to-t from-card to-card/95 backdrop-blur-sm border-t border-white/10 p-4">
              <button
                onClick={() => onProceedToCheckout(bundle)}
                className="w-full bg-white hover:bg-white/90 text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] cursor-pointer"
              >
                <span className="text-sm">Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}