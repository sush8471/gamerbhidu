"use client";

import {
  X, AlertTriangle, Sparkles, Loader2, Upload, FileImage,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import GenreSelector from "@/components/admin/genre-selector";
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
  if (!open) return null;

  const set = (field: keyof GameFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onFormDataChange((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full sm:max-w-2xl bg-[#111111] border border-[#262626] sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-white">
            {mode === "add" ? "Add Game Listing" : "Edit Game Listing"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {formError && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg leading-relaxed">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Section: Media & Autofill */}
            <div className="border-t border-[#262626] pt-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Media & Autofill</p>

              <div className="bg-[#050505]/40 border border-[#262626] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Autofill from Steam Store</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <input
                      type="number"
                      value={formData.steam_app_id}
                      onChange={set("steam_app_id")}
                      placeholder="Enter Steam App ID (e.g. 3768760)"
                      className="w-full bg-[#050505]/80 border border-[#262626] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-all placeholder:text-gray-600 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={fetchingSteam || !formData.steam_app_id}
                    onClick={onFetchSteam}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs rounded-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    {fetchingSteam ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Autofill details</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Fetches title, description, poster cover, genres, and search keywords from the official Steam Store API.
                </p>
              </div>

              {/* Poster Thumbnail Drag & Drop Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Game Poster Cover Thumbnail <span className="text-red-500">*</span>
                </label>

                <div
                  onDragEnter={onDrag}
                  onDragOver={onDrag}
                  onDragLeave={onDrag}
                  onDrop={onDrop}
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer relative overflow-hidden h-48 bg-[#050505]/20 ${
                    dragActive ? "border-primary bg-primary/5" : "border-[#262626] hover:border-primary/50"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={onFileInput}
                    className="hidden"
                  />

                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground">Uploading poster image...</p>
                    </div>
                  ) : formData.image_url ? (
                    <>
                      <div className="absolute inset-0 z-0 opacity-40 blur-sm scale-110">
                        <Image
                          src={formData.image_url}
                          alt="Cover background"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <FileImage className="w-8 h-8 text-primary filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
                        <p className="text-xs text-white font-bold bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                          Change dropped poster or select file
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div className="text-center space-y-1">
                        <p className="text-xs text-gray-300 font-bold">Drag & drop game poster image here</p>
                        <p className="text-[10px] text-muted-foreground">or click to browse local files (PNG, JPG, WebP)</p>
                      </div>
                    </>
                  )}
                </div>

                <input
                  type="text"
                  required
                  value={formData.image_url}
                  onChange={set("image_url")}
                  placeholder="Or enter poster URL manually (e.g. /gta-v.jpg)"
                  className="w-full bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-xs text-white focus:outline-none placeholder:text-gray-600 font-mono"
                />
              </div>
            </div>

            {/* Section: Basic Info */}
            <div className="border-t border-[#262626] pt-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Basic Info</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Game Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={onTitleChange}
                    placeholder="Enter Title Name"
                    className="w-full bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/10 placeholder:text-gray-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={set("slug")}
                    placeholder="Auto-generated slug name"
                    className="w-full bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/10 placeholder:text-gray-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Original Price (INR)
                  </label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={set("original_price")}
                    placeholder="Original Price"
                    className="w-full bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/10 placeholder:text-gray-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Selling Price (INR)
                  </label>
                  <input
                    type="number"
                    value={formData.selling_price}
                    onChange={set("selling_price")}
                    placeholder="Selling/Discounted Price"
                    className="w-full bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/10 placeholder:text-gray-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Calculated Discount (%)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.discount_percentage ? `${formData.discount_percentage}%` : "0% (Auto-Calculated)"}
                    className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-sm text-muted-foreground focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Series Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.series}
                    onChange={set("series")}
                    placeholder="Series Name"
                    className="w-full bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/10 placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Section: Metadata */}
            <div className="border-t border-[#262626] pt-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Metadata</p>

              <GenreSelector
                value={formData.genre}
                onChange={(genre) => onFormDataChange((prev) => ({ ...prev, genre }))}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Search Aliases / Tags (Comma separated list)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={set("tags")}
                  placeholder="mario, nintendo, platforms"
                  className="w-full bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/10 placeholder:text-gray-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Description / Blurb (Optional - Fetched from Steam on detail page)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={set("description")}
                  placeholder="No need to fill this in if you have Steam App ID. It will be fetched automatically."
                  className="w-full bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/10 placeholder:text-gray-600 resize-none"
                />
              </div>
            </div>

            {/* Section: Publishing */}
            <div className="border-t border-[#262626] pt-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Publishing</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Release Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer select-none">
                      <input
                        type="radio"
                        name="release_status"
                        value="released"
                        checked={formData.release_status === "released"}
                        onChange={() => onFormDataChange((prev) => ({ ...prev, release_status: "released" }))}
                        className="accent-primary"
                      />
                      <span>Released</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer select-none">
                      <input
                        type="radio"
                        name="release_status"
                        value="upcoming"
                        checked={formData.release_status === "upcoming"}
                        onChange={() => onFormDataChange((prev) => ({ ...prev, release_status: "upcoming" }))}
                        className="accent-primary"
                      />
                      <span>Upcoming</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Storefront Visibility
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => onFormDataChange((prev) => ({ ...prev, visible: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#262626] accent-primary"
                    />
                    <span>Make listing visible on public storefront</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="border-t border-[#262626] p-4 bg-[#111111] flex justify-end gap-3 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading} className="font-black active:scale-[0.98]">
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "add" ? "Save Game" : "Update Game"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
