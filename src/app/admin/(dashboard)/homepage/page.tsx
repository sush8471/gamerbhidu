"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Home, Plus, GripVertical, Loader2, AlertTriangle, CheckCircle, Layers,
  Trash2, Eye, EyeOff, X, Edit2, ExternalLink, Tag
} from "lucide-react";
import Image from "next/image";
import CombosTab from "@/components/admin/combos-tab";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import GamePicker from "@/components/admin/games/GamePicker";

type Section = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
};

type GameMapping = {
  id: string; // section_games UUID
  display_order: number;
  game_id: string;
  title: string;
  slug: string;
  image_url: string;
  selling_price: number | null;
  original_price: number | null;
  discount_percentage: number | null;
  visible: boolean;
  release_status: string | null;
};

type DropdownGame = {
  id: string;
  title: string;
  slug: string;
};

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showCombos, setShowCombos] = useState(false);
  const [mappings, setMappings] = useState<GameMapping[]>([]);
  const [allVisibleGames, setAllVisibleGames] = useState<DropdownGame[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [mappingsLoading, setMappingsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<GameMapping | null>(null);

  // Selector form state
  const [selectedGameId, setSelectedGameId] = useState("");

  // Load sections on mount
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch homepage sections
        const { data: sectionData, error: sectionError } = await supabase
          .from("homepage_sections")
          .select("*")
          .order("display_order", { ascending: true });

        if (sectionError) throw sectionError;
        setSections(sectionData || []);

        if (sectionData && sectionData.length > 0) {
          setActiveSectionId(sectionData[0].id);
        }

        // 2. Fetch all visible games (for dropdown add)
        const { data: gamesData, error: gamesError } = await supabase
          .from("games")
          .select("id, title, slug")
          .eq("visible", true)
          .order("title", { ascending: true });

        if (gamesError) throw gamesError;
        setAllVisibleGames(gamesData || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load homepage sections.");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Fetch mappings when active section changes
  const loadSectionMappings = async (sectionId: string) => {
    setMappingsLoading(true);
    try {
      const { data, error: mappingsError } = await supabase
        .from("homepage_sections")
        .select(`
          id,
          section_games (
            id,
            display_order,
            game_id,
            games (
              id,
              title,
              slug,
              image_url,
              selling_price,
              original_price,
              discount_percentage,
              visible,
              release_status
            )
          )
        `)
        .eq("id", sectionId)
        .single();

      if (mappingsError) throw mappingsError;

      // Extract and map
      const rawMappings = data?.section_games || [];
      const mapped: GameMapping[] = rawMappings
        .filter((m: any) => m.games)
        .map((m: any) => ({
          id: m.id,
          display_order: m.display_order,
          game_id: m.game_id,
          title: m.games.title,
          slug: m.games.slug,
          image_url: m.games.image_url,
          selling_price: m.games.selling_price,
          original_price: m.games.original_price,
          discount_percentage: m.games.discount_percentage,
          visible: m.games.visible,
          release_status: m.games.release_status,
        }));

      // Sort by display order
      mapped.sort((a, b) => a.display_order - b.display_order);
      setMappings(mapped);
    } catch (err) {
      console.error("Failed to load section mappings:", err);
    } finally {
      setMappingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSectionId) {
      loadSectionMappings(activeSectionId);
      setSelectedGameId("");
    }
  }, [activeSectionId]);

  // Compute unmapped games for dropdown
  const unmappedGames = useMemo(() => {
    return allVisibleGames.filter(
      (game) => !mappings.some((m) => m.game_id === game.id)
    );
  }, [allVisibleGames, mappings]);

  // Drag-and-drop reorder
  const dragItemRef = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragItemRef.current;
    if (from === null || from === index) return;

    const updated = [...mappings];
    const [moved] = updated.splice(from, 1);
    updated.splice(index, 0, moved);
    dragItemRef.current = index;

    // Optimistic reorder
    setMappings(updated);
  };

  const handleDragEnd = async () => {
    dragItemRef.current = null;
    // Persist the new order to the database
    const updates = mappings.map((m, i) => ({
      id: m.id,
      display_order: (i + 1) * 10,
    }));
    try {
      const results = await Promise.all(
        updates.map((u) =>
          supabase.from("section_games").update({ display_order: u.display_order }).eq("id", u.id)
        )
      );
      const error = results.find((r) => r.error)?.error;
      if (error) throw error;
    } catch (err) {
      console.error("Failed to persist reorder:", err);
      if (activeSectionId) loadSectionMappings(activeSectionId);
    }
  };

  // Add Game Mapping
  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId || !activeSectionId) return;

    setActionLoading(true);
    setActionError(null);
    try {
      const nextOrder = mappings.length > 0 
        ? Math.max(...mappings.map((m) => m.display_order)) + 1 
        : 1;

      const { error: insertError } = await supabase
        .from("section_games")
        .insert([
          {
            section_id: activeSectionId,
            game_id: selectedGameId,
            display_order: nextOrder,
          },
        ]);

      if (insertError) throw insertError;

      setSelectedGameId("");
      toast.success("Game assigned to section");
      loadSectionMappings(activeSectionId);
    } catch (err) {
      console.error("Failed to add game mapping:", err);
      setActionError("Failed to assign game to this section.");
    } finally {
      setActionLoading(false);
    }
  };

  // Remove Game Mapping (with confirmation dialog)
  const handleRemoveGame = async () => {
    if (!gameToDelete) return;
    setDeleteModalOpen(false);
    setActionLoading(true);
    setActionError(null);
    try {
      const { error: deleteError } = await supabase
        .from("section_games")
        .delete()
        .eq("id", gameToDelete.id);

      if (deleteError) throw deleteError;

      if (activeSectionId) loadSectionMappings(activeSectionId);
      toast.success(`${gameToDelete.title} removed from section`);
      setGameToDelete(null);
    } catch (err) {
      console.error("Failed to remove game mapping:", err);
      setActionError("Failed to remove game from this section.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading Sections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-sm text-gray-300 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab Selectors (Segmented Control style) */}
      <div className="relative max-w-fit">
        <div className="flex p-1 bg-[#050505]/60 border border-[#262626] rounded-xl overflow-x-auto max-w-fit">
          {sections.map((section) => {
            const isActive = !showCombos && activeSectionId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => { setShowCombos(false); setActiveSectionId(section.id); }}
                className={`px-4 py-2 text-xs lg:text-sm font-bold tracking-wide transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,210,255,0.05)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {section.name}
              </button>
            );
          })}
          <button
            onClick={() => { setShowCombos(true); setActiveSectionId(null); }}
            className={`px-4 py-2 text-xs lg:text-sm font-bold tracking-wide transition-all rounded-lg cursor-pointer whitespace-nowrap ${
              showCombos
                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,210,255,0.05)]"
                : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
            Value Combos
          </button>
        </div>
        {/* Right-edge overflow indicator */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050505] to-transparent rounded-r-xl lg:hidden" />
      </div>

      {showCombos ? (
        <CombosTab />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Mapping list table */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
            <h3 className="font-bold text-white">Active Section Listings</h3>
            <span className="text-xs font-bold text-muted-foreground bg-[#262626] px-2.5 py-1 rounded-full">
              {mappings.length} {mappings.length === 1 ? "game" : "games"}
            </span>
          </div>

          {mappingsLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Updating section games...</p>
            </div>
          ) : mappings.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Home className="w-10 h-10 stroke-[1.25]" />
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold">No games assigned to this section</p>
                <p className="text-[10px] text-muted-foreground">Use the panel on the right to add games</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#262626]/60">
              {mappings.map((mapping, i) => (
                <div
                  key={mapping.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors gap-3 group cursor-grab active:cursor-grabbing"
                >
                  {/* Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Drag Handle */}
                    <div className="flex-shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Image */}
                    <div className="relative w-8 h-10 bg-black/20 rounded border border-[#262626] overflow-hidden flex-shrink-0">
                      <Image
                        src={mapping.image_url}
                        alt={mapping.title}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>

                    {/* Title + Slug */}
                    <div className="min-w-0">
                      <p className="font-bold text-white text-xs lg:text-sm leading-snug truncate" title={mapping.title}>{mapping.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">/{mapping.slug}</p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-9 sm:ml-0">
                    <div className="text-right">
                      <p className="text-xs font-black text-white">₹{mapping.selling_price ?? 0}</p>
                      {mapping.original_price != null && mapping.original_price > (mapping.selling_price ?? 0) && (
                        <p className="text-[10px] text-muted-foreground line-through">₹{mapping.original_price}</p>
                      )}
                    </div>

                    {/* Discount badge */}
                    {mapping.discount_percentage != null && mapping.discount_percentage > 0 && (
                      <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                        -{mapping.discount_percentage}%
                      </span>
                    )}

                    {/* Visibility */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      mapping.visible
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-gray-500/10 text-muted-foreground border-gray-500/20"
                    }`}>
                      {mapping.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                      {mapping.visible ? "Live" : "Hidden"}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <a
                        href={`/games/${mapping.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-white/5 rounded transition-all cursor-pointer"
                        title="View on store"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        disabled={actionLoading}
                        onClick={() => { setGameToDelete(mapping); setDeleteModalOpen(true); }}
                        className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/5 rounded transition-all cursor-pointer"
                        title="Remove from section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add game controller panel */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            <h3 className="font-bold text-white">Add Game to Section</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Assign a visible catalog game to the currently selected homepage section. New games are appended to the bottom.
            </p>
          </div>

          {actionError && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-3 rounded-lg leading-relaxed">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}

          <form onSubmit={handleAddGame} className="space-y-4 pt-2">
            <GamePicker
              options={unmappedGames}
              value={selectedGameId ? [selectedGameId] : []}
              onChange={(ids) => setSelectedGameId(ids[0] || "")}
              placeholder={unmappedGames.length === 0 ? "No unmapped games available" : "Search games to add..."}
              label="Select Game"
              single
            />

            <Button
              type="submit"
              disabled={actionLoading || !selectedGameId}
              className="w-full font-black active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Assign to Section
            </Button>
          </form>

          {unmappedGames.length === 0 && (
            <div className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] p-3 rounded-lg leading-relaxed mt-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>All visible storefront listings are already assigned to this section.</span>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && gameToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-red-500/20 rounded-2xl shadow-2xl p-6 space-y-6 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Remove Game?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Remove <span className="text-white font-semibold">"{gameToDelete.title}"</span> from this homepage section? You can re-add it later.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setGameToDelete(null); }}>Cancel</Button>
              <Button variant="destructive" onClick={handleRemoveGame} disabled={actionLoading} className="active:scale-[0.98]">
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
