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
      <SheetContent side="bottom" className="bg-card border-t border-border rounded-t-2xl shadow-2xl p-4 md:hidden">
        {game && (
          <>
            <SheetHeader className="pb-3 border-b border-border">
              <SheetTitle className="text-white text-sm font-bold truncate">{game.title}</SheetTitle>
              <SheetDescription className="text-[10px] text-muted-foreground font-mono">/{game.slug}</SheetDescription>
            </SheetHeader>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => {
                  onToggleVisibility(game);
                  if (pendingToggleId === game.id) onOpenChange(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  pendingToggleId === game.id
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : game.visible
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-muted/10 text-muted-foreground border-border"
                }`}
              >
                {pendingToggleId === game.id ? (
                  <><AlertTriangle className="w-3.5 h-3.5" />Confirm</>
                ) : game.visible ? (
                  <><Eye className="w-3.5 h-3.5" />Visible</>
                ) : (
                  <><EyeOff className="w-3.5 h-3.5" />Hidden</>
                )}
              </button>

              <button
                onClick={() => { onEdit(game); onOpenChange(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-background border border-border rounded-lg text-xs font-bold text-white hover:border-white/30 transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-white" />
                Edit
              </button>

              <button
                onClick={() => { onDelete(game); onOpenChange(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-background border border-red-500/20 rounded-lg text-xs font-bold text-red-400 hover:border-red-500/40 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
