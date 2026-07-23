"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Eye, EyeOff, Edit2, Trash2, AlertTriangle } from "lucide-react";
import type { DbGame } from "@/types/game";

type Props = {
  game: DbGame | null;
  pendingToggleId: string | null;
  onOpenChange: (open: boolean) => void;
  onToggleVisibility: (game: DbGame) => void;
  onEdit: (game: DbGame) => void;
  onDelete: (game: DbGame) => void;
};

export default function GameMobileActionSheet({
  game,
  pendingToggleId,
  onOpenChange,
  onToggleVisibility,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Sheet open={!!game} onOpenChange={(open) => !open && onOpenChange(false)}>
      <SheetContent side="bottom" className="bg-[#111111] border-t border-[#262626] rounded-t-2xl shadow-2xl p-6 flex flex-col space-y-4 md:hidden">
        {game && (
          <>
            <SheetHeader className="border-b border-[#262626] pb-3">
              <SheetTitle className="text-white text-sm font-bold truncate">{game.title}</SheetTitle>
              <SheetDescription className="text-[10px] text-muted-foreground font-mono">/{game.slug}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onToggleVisibility(game);
                  if (pendingToggleId === game.id) {
                    onOpenChange(false);
                  }
                }}
                className={`flex items-center gap-3 w-full p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                  pendingToggleId === game.id
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : game.visible
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-gray-500/5 text-muted-foreground border-gray-500/10"
                }`}
              >
                {pendingToggleId === game.id ? (
                  <><AlertTriangle className="w-4 h-4" /><span>Tap again to confirm</span></>
                ) : game.visible ? (
                  <><Eye className="w-4 h-4" /><span>Storefront Visibility: Visible</span></>
                ) : (
                  <><EyeOff className="w-4 h-4" /><span>Storefront Visibility: Hidden</span></>
                )}
              </button>

              <button
                onClick={() => {
                  onEdit(game);
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 w-full p-3 bg-[#262626]/50 hover:bg-[#262626] border border-[#262626] text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-primary" />
                <span>Edit Game Details</span>
              </button>

              <button
                onClick={() => {
                  onDelete(game);
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 w-full p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Game Listing</span>
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
