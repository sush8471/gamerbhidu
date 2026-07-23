"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DbGame } from "@/types/game";

type Props = {
  open: boolean;
  game: DbGame | null;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function GameDeleteModal({
  open,
  game,
  loading,
  error,
  onCancel,
  onConfirm,
}: Props) {
  if (!open || !game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111111] border border-red-500/20 rounded-2xl shadow-2xl p-6 space-y-6 animate-fadeIn">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Delete Listing?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <span className="text-white font-semibold">"{game.title}"</span>? This will permanently remove the record and any storefront homepage section mappings. This action cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg leading-relaxed">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="active:scale-[0.98]"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete permanently
          </Button>
        </div>
      </div>
    </div>
  );
}
