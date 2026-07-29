"use client";

import { useEffect } from "react";
import {
  X, AlertTriangle, Sparkles, Loader2, Upload, FileImage,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { GameFormData } from "@/types/game";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  formData: GameFormData;
  onFormDataChange: (updater: (prev: GameFormData) => GameFormData) => void;
  formError: string | null;
  formLoading: boolean;
  fetchingSteam: boolean;
  uploadingImage: boolean;
  dragActive: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFetchSteam: () => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function GameFormModal({
  open,
  onClose,
  mode,
  formData,
  onFormDataChange,
  formError,
  formLoading,
  fetchingSteam,
  uploadingImage,
  dragActive,
  onSubmit,
  onTitleChange,
  onFetchSteam,
  onDrag,
  onDrop,
  onFileInput,
}: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  const set = (field: keyof GameFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onFormDataChange((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="w-full h-full sm:h-auto sm:max-w-lg bg-card border-0 sm:border border-border sm:rounded-xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h3 className="text-base font-bold text-foreground">
            {mode === "add" ? "Add Game" : "Edit Game"}
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain p-5 space-y-4">
            {formError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2.5 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Steam Autofill */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={formData.steam_app_id}
                  onChange={set("steam_app_id")}
                  placeholder="Steam App ID"
                  className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50 font-mono"
                />
              </div>
              <button
                type="button"
                disabled={fetchingSteam || !formData.steam_app_id}
                onClick={onFetchSteam}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs rounded-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                {fetchingSteam ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Autofill
              </button>
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Game Poster Cover <span className="text-red-500">*</span></label>
              <div
                onDragEnter={onDrag} onDragOver={onDrag} onDragLeave={onDrag} onDrop={onDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
                className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden aspect-[3/4] max-h-48 ${
                  dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <input type="file" id="file-upload" accept="image/*" onChange={onFileInput} className="hidden" />
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Uploading...</p>
                  </div>
                ) : formData.image_url ? (
                  <>
                    <div className="absolute inset-0 z-0">
                      <Image src={formData.image_url} alt="" fill className="object-cover" />
                    </div>
                    <div className="absolute inset-0 z-10 bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                      <FileImage className="w-6 h-6 text-primary" />
                      <p className="text-xs text-white font-semibold">Drop or click to change</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-xs text-foreground font-semibold">Drag & drop poster image</p>
                      <p className="text-[10px] text-muted-foreground">PNG, JPG, WebP</p>
                    </div>
                  </>
                )}
              </div>
              <input
                type="text"
                required
                value={formData.image_url}
                onChange={set("image_url")}
                placeholder="Or paste image URL"
                className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/50 font-mono"
              />
            </div>

            {/* Title + Slug */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Title *</label>
                <input type="text" required value={formData.title} onChange={onTitleChange} placeholder="Game title" className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Slug *</label>
                <input type="text" required value={formData.slug} onChange={set("slug")} placeholder="game-slug" className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50 font-mono" />
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Original Price</label>
                <input type="number" value={formData.original_price} onChange={set("original_price")} placeholder="₹" className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Selling Price</label>
                <input type="number" value={formData.selling_price} onChange={set("selling_price")} placeholder="₹" className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Discount</label>
                <input type="text" disabled value={formData.discount_percentage ? `${formData.discount_percentage}%` : "Auto"} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground font-mono" />
              </div>
            </div>

            {/* Genre + Series */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Genre *</label>
                <select
                  value={formData.genre}
                  onChange={(e) => onFormDataChange((prev) => ({ ...prev, genre: e.target.value }))}
                  className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="">Select genre</option>
                  <option value="Action">Action</option>
                  <option value="Adventure">Adventure</option>
                  <option value="RPG">RPG</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Simulation">Simulation</option>
                  <option value="Sports">Sports</option>
                  <option value="Racing">Racing</option>
                  <option value="Fighting">Fighting</option>
                  <option value="Shooter">Shooter</option>
                  <option value="Puzzle">Puzzle</option>
                  <option value="Platformer">Platformer</option>
                  <option value="Stealth">Stealth</option>
                  <option value="Survival">Survival</option>
                  <option value="Horror">Horror</option>
                  <option value="Open World">Open World</option>
                  <option value="MMO">MMO</option>
                  <option value="Battle Royale">Battle Royale</option>
                  <option value="Roguelike">Roguelike</option>
                  <option value="Metroidvania">Metroidvania</option>
                  <option value="Soulslike">Soulslike</option>
                  <option value="Sandbox">Sandbox</option>
                  <option value="Visual Novel">Visual Novel</option>
                  <option value="Tower Defense">Tower Defense</option>
                  <option value="Turn-Based">Turn-Based</option>
                  <option value="Card Game">Card Game</option>
                  <option value="Rhythm">Rhythm</option>
                  <option value="Party">Party</option>
                  <option value="Educational">Educational</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Series</label>
                <input type="text" value={formData.series} onChange={set("series")} placeholder="Series name" className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50" />
              </div>
            </div>

            {/* Publishing */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                  <input type="radio" name="release_status" value="released" checked={formData.release_status === "released"} onChange={() => onFormDataChange((prev) => ({ ...prev, release_status: "released" }))} className="accent-primary" />
                  Released
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                  <input type="radio" name="release_status" value="upcoming" checked={formData.release_status === "upcoming"} onChange={() => onFormDataChange((prev) => ({ ...prev, release_status: "upcoming" }))} className="accent-primary" />
                  Upcoming
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                <input type="checkbox" checked={formData.visible} onChange={(e) => onFormDataChange((prev) => ({ ...prev, visible: e.target.checked }))} className="w-4 h-4 rounded accent-primary" />
                Visible
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-3.5 border-t border-border bg-card">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={formLoading} className="font-bold active:scale-[0.98]">
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "add" ? "Save Game" : "Update Game"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
