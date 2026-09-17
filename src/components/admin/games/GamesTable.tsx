"use client";

import {
  Gamepad2, Plus, Edit2, Trash2, Eye, EyeOff, AlertTriangle,
  MoreVertical, Loader2,
} from "lucide-react";
import Image from "next/image";
import type { DbGame } from "@/types/game";

type Props = {
  loading: boolean;
  error: string | null;
  filteredGames: DbGame[];
  paginatedGames: DbGame[];
  pendingToggleId: string | null;
  onRetry: () => void;
  onToggleVisibility: (game: DbGame) => void;
  onEdit: (game: DbGame) => void;
  onDelete: (game: DbGame) => void;
  onOpenMobileActions: (game: DbGame) => void;
  onAdd: () => void;
  hasActiveFilters: boolean;
  viewMode?: "grid" | "table";
};

// Helper for status badge styling
function getStatusBadge(game: DbGame) {
  if (!game.visible) {
    return {
      label: "HIDDEN",
      colorClass: "bg-zinc-800/90 text-zinc-400 border-zinc-700/60",
      dotClass: "bg-zinc-500",
    };
  }
  if (game.release_status === "upcoming") {
    return {
      label: "UPCOMING",
      colorClass: "bg-amber-950/60 text-amber-300 border-amber-500/30",
      dotClass: "bg-amber-400",
    };
  }
  return {
    label: "LIVE",
    colorClass: "bg-emerald-950/80 text-emerald-400 border-emerald-500/30",
    dotClass: "bg-emerald-400 animate-pulse",
  };
}

export default function GamesTable({
  loading,
  error,
  filteredGames,
  paginatedGames,
  pendingToggleId,
  onRetry,
  onToggleVisibility,
  onEdit,
  onDelete,
  onOpenMobileActions,
  onAdd,
  hasActiveFilters,
  viewMode = "grid",
}: Props) {
  if (loading) {
    return (
      <div className="h-72 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-72 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-sm text-gray-300 font-bold">{error}</p>
        <button onClick={onRetry} className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  if (filteredGames.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center gap-3 text-muted-foreground p-6">
        <Gamepad2 className="w-12 h-12 stroke-[1.25]" />
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-white">No game listings found</p>
          <p className="text-xs text-muted-foreground">
            {hasActiveFilters ? "Try adjusting your search or filters" : "Get started by adding your first game"}
          </p>
        </div>
        {!hasActiveFilters && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-black text-xs rounded-xl hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Game</span>
          </button>
        )}
      </div>
    );
  }

  // Common card renderer for grid views (both mobile 2-col and desktop grid)
  const renderGameCard = (game: DbGame) => {
    const status = getStatusBadge(game);
    return (
      <div
        key={game.id}
        className="group relative flex flex-col rounded-2xl bg-[#0d0d0d] border border-[#1f1f1f] hover:border-white/20 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-white/5"
      >
        {/* Cover Art Container */}
        <div className="relative w-full aspect-[3/4] bg-black/40 overflow-hidden">
          <Image
            src={game.image_url}
            alt={game.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-black/40 pointer-events-none" />

          {/* Top Badges Row */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
            {/* Status Chip */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider border backdrop-blur-md shadow-md ${status.colorClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
              {status.label}
            </span>

            {/* Discount tag */}
            {game.discount_percentage ? (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-white/15 text-white backdrop-blur-md border border-white/10 shadow">
                -{game.discount_percentage}%
              </span>
            ) : null}
          </div>

          {/* Quick Mobile Action sheet button overlay */}
          <button
            onClick={() => onOpenMobileActions(game)}
            aria-label="Game actions"
            className="md:hidden absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white/80 hover:text-white border border-white/10"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <h3
              className="text-white font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-zinc-200 transition-colors"
              title={game.title}
            >
              {game.title}
            </h3>

            {/* Slug / Series */}
            <p className="text-[10px] text-muted-foreground/80 font-mono truncate">
              {game.series ? game.series : `/${game.slug}`}
            </p>

            {/* Genre pills */}
            {game.genre && game.genre.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {game.genre.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="text-[9px] font-semibold text-zinc-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded"
                  >
                    {g}
                  </span>
                ))}
                {game.genre.length > 2 && (
                  <span className="text-[9px] text-zinc-500">
                    +{game.genre.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price & Action Row */}
          <div className="pt-2 border-t border-[#1a1a1a] flex items-center justify-between gap-1">
            {/* Price */}
            <div>
              {game.selling_price !== null ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-white">
                    ₹{game.selling_price}
                  </span>
                  {game.original_price && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      ₹{game.original_price}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Free / TBA
                </span>
              )}
            </div>

            {/* Desktop Quick Actions */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onToggleVisibility(game)}
                title={game.visible ? "Hide from store" : "Make live in store"}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  pendingToggleId === game.id
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : game.visible
                    ? "text-emerald-400 hover:bg-emerald-500/10 border-transparent hover:border-emerald-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                {pendingToggleId === game.id ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : game.visible ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => onEdit(game)}
                title="Edit listing"
                className="p-1.5 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDelete(game)}
                title="Delete listing"
                className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Mobile View: ALWAYS 2-column card grid */}
      <div className="md:hidden grid grid-cols-2 gap-2.5 p-3">
        {paginatedGames.map(renderGameCard)}
      </div>

      {/* 2. Desktop View: Controlled by viewMode */}
      <div className="hidden md:block">
        {viewMode === "grid" ? (
          /* Desktop Grid View */
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {paginatedGames.map(renderGameCard)}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-[#0a0a0a] text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-5 w-16">Cover</th>
                  <th className="py-3.5 px-5">Title & Genre</th>
                  <th className="py-3.5 px-5 w-32">Price</th>
                  <th className="py-3.5 px-5 w-24">Discount</th>
                  <th className="py-3.5 px-5 w-28 text-center">Status</th>
                  <th className="py-3.5 px-5 w-28 text-center">Visibility</th>
                  <th className="py-3.5 px-5 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a] text-sm">
                {paginatedGames.map((game) => {
                  const status = getStatusBadge(game);
                  return (
                    <tr
                      key={game.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Portrait Thumbnail */}
                      <td className="py-3 px-5">
                        <div className="relative w-11 h-14 bg-black/40 rounded-lg border border-[#262626] overflow-hidden flex-shrink-0">
                          <Image
                            src={game.image_url}
                            alt={game.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Title + Genre pills */}
                      <td className="py-3 px-5">
                        <p
                          className="font-bold text-white max-w-sm truncate text-sm"
                          title={game.title}
                        >
                          {game.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p
                            className="text-xs text-muted-foreground font-mono tracking-tighter truncate max-w-xs"
                            title={game.slug}
                          >
                            /{game.slug}
                          </p>
                          {game.genre && game.genre.length > 0 && (
                            <div className="flex items-center gap-1">
                              {game.genre.slice(0, 2).map((g) => (
                                <span
                                  key={g}
                                  className="text-[9px] font-semibold text-zinc-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-5">
                        {game.selling_price !== null ? (
                          <div>
                            <p className="font-black text-white text-sm">
                              ₹{game.selling_price}
                            </p>
                            {game.original_price && (
                              <p className="text-xs text-muted-foreground line-through">
                                ₹{game.original_price}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground font-bold bg-[#1a1a1a] px-2 py-0.5 rounded">
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Discount */}
                      <td className="py-3 px-5">
                        {game.discount_percentage ? (
                          <span className="text-xs font-black bg-white/15 text-white px-2 py-0.5 rounded-md border border-white/10">
                            -{game.discount_percentage}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Status Chip */}
                      <td className="py-3 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.colorClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                          {status.label}
                        </span>
                      </td>

                      {/* Visibility Toggle */}
                      <td className="py-3 px-5 text-center">
                        <button
                          onClick={() => onToggleVisibility(game)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[34px] border ${
                            pendingToggleId === game.id
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : game.visible
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15"
                              : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:text-white"
                          }`}
                        >
                          {pendingToggleId === game.id ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Confirm?</span>
                            </>
                          ) : game.visible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit(game)}
                            className="p-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                            title="Edit game listing"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(game)}
                            className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete game listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
