"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Home, Plus, Trash2, ArrowUp, ArrowDown, Loader2, AlertTriangle, CheckCircle 
} from "lucide-react";
import Image from "next/image";

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
};

type DropdownGame = {
  id: string;
  title: string;
  slug: string;
};

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [mappings, setMappings] = useState<GameMapping[]>([]);
  const [allVisibleGames, setAllVisibleGames] = useState<DropdownGame[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [mappingsLoading, setMappingsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              selling_price
            )
          )
        `)
        .eq("id", sectionId)
        .single();

      if (mappingsError) throw mappingsError;

      // Extract and map
      const rawMappings = data?.section_games || [];
      const mapped: GameMapping[] = rawMappings
        .filter((m: any) => m.games) // Ensure game relation is populated
        .map((m: any) => ({
          id: m.id,
          display_order: m.display_order,
          game_id: m.game_id,
          title: m.games.title,
          slug: m.games.slug,
          image_url: m.games.image_url,
          selling_price: m.games.selling_price,
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
      setSelectedGameId(""); // Reset select dropdown
    }
  }, [activeSectionId]);

  // Compute unmapped games for dropdown
  const unmappedGames = useMemo(() => {
    return allVisibleGames.filter(
      (game) => !mappings.some((m) => m.game_id === game.id)
    );
  }, [allVisibleGames, mappings]);

  // Swap display_order of two mappings
  const handleSwapOrder = async (indexA: number, indexB: number) => {
    if (indexA < 0 || indexA >= mappings.length || indexB < 0 || indexB >= mappings.length) return;
    
    const mappingA = mappings[indexA];
    const mappingB = mappings[indexB];

    // Optimistic state swap
    setMappings(prev => {
      const updated = [...prev];
      updated[indexA] = { ...mappingB, display_order: mappingA.display_order };
      updated[indexB] = { ...mappingA, display_order: mappingB.display_order };
      return updated;
    });

    try {
      const { error: swapError } = await supabase.rpc("swap_section_game_orders", {
        mapping_a_id: mappingA.id,
        mapping_b_id: mappingB.id,
        order_a: mappingB.display_order,
        order_b: mappingA.display_order
      });

      // If the RPC does not exist, we fall back to standard update queries:
      if (swapError) {
        const results = await Promise.all([
          supabase.from("section_games").update({ display_order: mappingB.display_order }).eq("id", mappingA.id),
          supabase.from("section_games").update({ display_order: mappingA.display_order }).eq("id", mappingB.id)
        ]);
        
        const updateError = results[0].error || results[1].error;
        if (updateError) throw updateError;
      }
    } catch (err) {
      console.error("Failed to swap order:", err);
      if (activeSectionId) loadSectionMappings(activeSectionId); // Revert
    }
  };

  // Add Game Mapping
  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId || !activeSectionId) return;

    setActionLoading(true);
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
      loadSectionMappings(activeSectionId);
    } catch (err) {
      console.error("Failed to add game mapping:", err);
      alert("Failed to assign game to this section.");
    } finally {
      setActionLoading(false);
    }
  };

  // Remove Game Mapping
  const handleRemoveGame = async (mappingId: string) => {
    setActionLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from("section_games")
        .delete()
        .eq("id", mappingId);

      if (deleteError) throw deleteError;

      if (activeSectionId) loadSectionMappings(activeSectionId);
    } catch (err) {
      console.error("Failed to remove game mapping:", err);
      alert("Failed to remove game from this section.");
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
      <div className="flex p-1 bg-[#080A10]/60 border border-[#202838] rounded-xl overflow-x-auto scrollbar-hide max-w-fit">
        {sections.map((section) => {
          const isActive = activeSectionId === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Mapping list table */}
        <div className="lg:col-span-2 bg-[#121622] border border-[#202838] rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#202838] flex items-center justify-between">
            <h3 className="font-bold text-white">Active Section Listings</h3>
            <span className="text-xs font-bold text-muted-foreground bg-[#202838] px-2.5 py-1 rounded-full">
              {mappings.length} {mappings.length === 1 ? "game" : "games"}
            </span>
          </div>

          {mappingsLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Updating section games...</p>
            </div>
          ) : mappings.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Home className="w-10 h-10 stroke-[1.25]" />
              <p className="text-xs font-semibold">No games assigned to this section</p>
            </div>
          ) : (
            <div className="divide-y divide-[#202838]/60">
              {mappings.map((mapping, i) => (
                <div key={mapping.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.01] transition-colors gap-3 group">
                  {/* Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Index Display Badge */}
                    <span className="w-5 h-5 rounded-full bg-[#080A10]/80 border border-[#202838] flex items-center justify-center text-[10px] text-muted-foreground font-mono font-bold flex-shrink-0">
                      {i + 1}
                    </span>

                    {/* Image */}
                    <div className="relative w-8 h-10 bg-black/20 rounded border border-[#202838] overflow-hidden flex-shrink-0">
                      <Image
                        src={mapping.image_url}
                        alt={mapping.title}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>

                    {/* Title */}
                    <div className="min-w-0">
                      <p className="font-bold text-white text-xs lg:text-sm leading-snug truncate" title={mapping.title}>{mapping.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">/{mapping.slug}</p>
                    </div>
                  </div>

                  {/* Actions (Reorder/Remove) */}
                  <div className="flex items-center justify-end gap-3.5 flex-shrink-0">
                    {/* Move Controls */}
                    <div className="flex items-center border border-[#202838] bg-[#080A10]/40 rounded-lg p-0.5">
                      <button
                        disabled={i === 0 || actionLoading}
                        onClick={() => handleSwapOrder(i, i - 1)}
                        className="p-2 text-muted-foreground hover:text-primary disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <div className="w-[1px] h-5 bg-[#202838]" />
                      <button
                        disabled={i === mappings.length - 1 || actionLoading}
                        onClick={() => handleSwapOrder(i, i + 1)}
                        className="p-2 text-muted-foreground hover:text-primary disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRemoveGame(mapping.id)}
                      className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
                      title="Remove from section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add game controller panel */}
        <div className="bg-[#121622] border border-[#202838] rounded-xl p-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            <h3 className="font-bold text-white">Add Game to Section</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Assign a visible catalog game to the currently selected homepage section. New games are appended to the bottom.
            </p>
          </div>

          <form onSubmit={handleAddGame} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Select Game
              </label>
              <select
                disabled={actionLoading || unmappedGames.length === 0}
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full bg-[#080A10]/50 border border-[#202838] focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/10 disabled:opacity-50 cursor-pointer"
              >
                <option value="">-- Choose a game to add --</option>
                {unmappedGames.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={actionLoading || !selectedGameId}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00D2FF] to-[#00B8E6] text-primary-foreground font-black text-sm py-3 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign to Section</span>
            </button>
          </form>

          {unmappedGames.length === 0 && (
            <div className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] p-3 rounded-lg leading-relaxed mt-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>All visible storefront listings are already assigned to this section.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
