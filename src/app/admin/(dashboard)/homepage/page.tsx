"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Home, Plus, GripVertical, Loader2, AlertTriangle, CheckCircle, Layers,
  Trash2, Eye, EyeOff, X, Edit2, Search, ChevronLeft, ChevronRight, MoreVertical,
  PanelRightOpen, Rocket
} from "lucide-react";
import Image from "next/image";
import CombosTab from "@/components/admin/combos-tab";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import GamePicker from "@/components/admin/games/GamePicker";
import GameFormModal from "@/components/admin/games/GameFormModal";
import MobileActionSheet from "@/components/admin/MobileActionSheet";
import type { GameFormData } from "@/types/game";

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
  release_status: "released" | "upcoming";
  genre: string[];
  tags: string[];
  series: string | null;
  description: string | null;
  steam_app_id: number | null;
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

  // Search & pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selector form state
  const [selectedGameId, setSelectedGameId] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // 3-dot menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Mobile sections panel
  const [sectionsPanelOpen, setSectionsPanelOpen] = useState(false);

  // Mobile action sheet
  const [mobileActionMapping, setMobileActionMapping] = useState<GameMapping | null>(null);

  // Check if current section is upcoming-games
  const isUpcomingSection = useMemo(() => {
    const activeSection = sections.find(s => s.id === activeSectionId);
    return activeSection?.slug === "upcoming-games";
  }, [sections, activeSectionId]);

  // Edit game modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<GameFormData>({
    title: "", slug: "", image_url: "",
    selling_price: "", original_price: "", discount_percentage: "",
    genre: "", series: "", description: "",
    release_status: "released", visible: true, steam_app_id: "",
  });
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [fetchingSteam, setFetchingSteam] = useState(false);
  const [fetchedTags, setFetchedTags] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
              release_status,
              genre,
              tags,
              series,
              description,
              steam_app_id
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
          visible: m.games.visible ?? true,
          release_status: m.games.release_status || "released",
          genre: m.games.genre || [],
          tags: m.games.tags || [],
          series: m.games.series ?? null,
          description: m.games.description ?? null,
          steam_app_id: m.games.steam_app_id ?? null,
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

  // Filtered and paginated mappings
  const filteredMappings = useMemo(() => {
    if (!searchQuery.trim()) return mappings;
    const q = searchQuery.toLowerCase();
    return mappings.filter((m) => m.title.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q));
  }, [mappings, searchQuery]);

  const totalPages = Math.ceil(filteredMappings.length / itemsPerPage) || 1;
  const paginatedMappings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMappings.slice(start, start + itemsPerPage);
  }, [filteredMappings, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // Drag-and-drop reorder
  const dragItemRef = useRef<number | null>(null);

  // Touch drag state for mobile
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const [touchCurrentIndex, setTouchCurrentIndex] = useState<number | null>(null);
  const touchStartY = useRef<number>(0);
  const touchItemHeight = useRef<number>(0);
  const touchCardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const persistOrder = async (newMappings: GameMapping[]) => {
    const updates = newMappings.map((m, i) => ({
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
    await persistOrder(mappings);
  };

  // Touch drag handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (searchQuery) return;
    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
    setTouchDragIndex(index);
    setTouchCurrentIndex(index);

    // Get the card height for calculating swap position
    const card = touchCardRefs.current.get(index);
    if (card) {
      touchItemHeight.current = card.offsetHeight;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchDragIndex === null || searchQuery) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartY.current;
    const cardHeight = touchItemHeight.current;

    if (cardHeight === 0) return;

    // Calculate how many positions we've moved
    const positionDelta = Math.round(deltaY / cardHeight);
    const newIndex = Math.max(0, Math.min(mappings.length - 1, touchDragIndex + positionDelta));

    if (newIndex !== touchCurrentIndex) {
      setTouchCurrentIndex(newIndex);
    }
  };

  const handleTouchEnd = async () => {
    if (touchDragIndex === null || touchCurrentIndex === null || touchDragIndex === touchCurrentIndex) {
      setTouchDragIndex(null);
      setTouchCurrentIndex(null);
      return;
    }

    // Apply the reorder
    const updated = [...mappings];
    const [moved] = updated.splice(touchDragIndex, 1);
    updated.splice(touchCurrentIndex, 0, moved);
    setMappings(updated);

    setTouchDragIndex(null);
    setTouchCurrentIndex(null);

    await persistOrder(updated);
  };

  const isMobileDragging = (index: number) => touchDragIndex === index;
  const isMobileDropTarget = (index: number) =>
    touchDragIndex !== null && touchCurrentIndex === index && touchDragIndex !== index;

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
      setAddModalOpen(false);
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

  const handleDirectToggleVisible = async (mapping: GameMapping) => {
    const updated = !mapping.visible;
    setMappings((prev) =>
      prev.map((m) => (m.game_id === mapping.game_id ? { ...m, visible: updated } : m))
    );
    try {
      const { error } = await supabase
        .from("games")
        .update({ visible: updated })
        .eq("id", mapping.game_id);
      if (error) throw error;
      toast.success(updated ? "Game is now visible on storefront" : "Game is now hidden from storefront");
    } catch {
      setMappings((prev) =>
        prev.map((m) => (m.game_id === mapping.game_id ? { ...m, visible: mapping.visible } : m))
      );
      toast.error("Failed to update visibility");
    }
  };

  // Move game from upcoming-games to recently-launched section
  const handleMoveToRecentlyLaunched = async (mapping: GameMapping) => {
    setActionLoading(true);
    try {
      // 1. Find the "recently-launched" section ID
      const { data: targetSection, error: sectionError } = await supabase
        .from("homepage_sections")
        .select("id")
        .eq("slug", "recently-launched")
        .single();

      if (sectionError || !targetSection) {
        throw new Error("Could not find Recently Launched section");
      }

      // 2. Check if game already exists in recently-launched
      const { data: existingMapping } = await supabase
        .from("section_games")
        .select("id")
        .eq("section_id", targetSection.id)
        .eq("game_id", mapping.game_id)
        .single();

      if (existingMapping) {
        toast.info("Game is already in Recently Launched section");
        // Still remove from upcoming
        await supabase.from("section_games").delete().eq("id", mapping.id);
        if (activeSectionId) loadSectionMappings(activeSectionId);
        setActionLoading(false);
        return;
      }

      // 3. Get the next display_order for the target section
      const { data: existingGames } = await supabase
        .from("section_games")
        .select("display_order")
        .eq("section_id", targetSection.id)
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder = existingGames && existingGames.length > 0
        ? existingGames[0].display_order + 10
        : 10;

      // 4. Insert into recently-launched
      const { error: insertError } = await supabase
        .from("section_games")
        .insert([{
          section_id: targetSection.id,
          game_id: mapping.game_id,
          display_order: nextOrder,
        }]);

      if (insertError) throw insertError;

      // 5. Remove from upcoming-games
      const { error: deleteError } = await supabase
        .from("section_games")
        .delete()
        .eq("id", mapping.id);

      if (deleteError) throw deleteError;

      // 6. Update game's release_status to "released"
      await supabase
        .from("games")
        .update({ release_status: "released" })
        .eq("id", mapping.game_id);

      toast.success(`${mapping.title} moved to Recently Launched`);
      if (activeSectionId) loadSectionMappings(activeSectionId);
    } catch (err: any) {
      console.error("Failed to move game:", err);
      toast.error(err?.message || "Failed to move game to Recently Launched");
    } finally {
      setActionLoading(false);
    }
  };

  // Auto-calc discount when prices change in edit form
  useEffect(() => {
    if (!editModalOpen) return;
    const sell = parseFloat(editFormData.selling_price);
    const orig = parseFloat(editFormData.original_price);
    if (!isNaN(sell) && !isNaN(orig) && orig > 0) {
      const pct = Math.round(((orig - sell) / orig) * 100);
      setEditFormData((prev) => ({
        ...prev,
        discount_percentage: pct > 0 ? pct.toString() : "",
      }));
    } else {
      setEditFormData((prev) => ({ ...prev, discount_percentage: "" }));
    }
  }, [editFormData.selling_price, editFormData.original_price, editModalOpen]);

  const openEditModal = async (mapping: GameMapping) => {
    setEditingGameId(mapping.game_id);
    setEditFormData({
      title: mapping.title,
      slug: mapping.slug,
      image_url: mapping.image_url || "",
      selling_price: mapping.selling_price !== null ? String(mapping.selling_price) : "",
      original_price: mapping.original_price !== null ? String(mapping.original_price) : "",
      discount_percentage: mapping.discount_percentage !== null ? String(mapping.discount_percentage) : "",
      genre: mapping.genre?.length ? mapping.genre.join(", ") : "",
      series: mapping.series || "",
      description: mapping.description || "",
      release_status: mapping.release_status || "released",
      visible: mapping.visible,
      steam_app_id: mapping.steam_app_id !== null ? String(mapping.steam_app_id) : "",
    });
    setEditFormError(null);
    setFetchedTags(mapping.tags || []);
    setEditModalOpen(true);

    // Load full game row so edit form always has complete fields
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", mapping.game_id)
        .single();
      if (error || !data) return;
      setEditFormData({
        title: data.title,
        slug: data.slug,
        image_url: data.image_url || "",
        selling_price: data.selling_price !== null ? String(data.selling_price) : "",
        original_price: data.original_price !== null ? String(data.original_price) : "",
        discount_percentage: data.discount_percentage !== null ? String(data.discount_percentage) : "",
        genre: data.genre?.length ? data.genre.join(", ") : "",
        series: data.series || "",
        description: data.description || "",
        release_status: data.release_status || "released",
        visible: data.visible ?? true,
        steam_app_id: data.steam_app_id !== null ? String(data.steam_app_id) : "",
      });
      setFetchedTags(data.tags || []);
    } catch (err) {
      console.error("Failed to load full game for edit:", err);
    }
  };

  const handleEditTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditFormData((prev) => ({ ...prev, title: val }));
  };

  const handleFetchSteam = async () => {
    const appId = editFormData.steam_app_id.trim();
    if (!appId) {
      setEditFormError("Please enter a Steam App ID first.");
      return;
    }
    setFetchingSteam(true);
    setEditFormError(null);
    try {
      const res = await fetch(`/api/steam?appId=${appId}`);
      if (!res.ok) throw new Error("Failed to fetch from Steam Store API.");
      const json = await res.json();
      const result = json[appId];
      if (!result?.success || !result.data) throw new Error("No data found for this Steam App ID.");
      const s = result.data;
      const title = s.name || "";
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      const genres = s.genres ? s.genres.map((g: any) => g.description).join(", ") : "";
      setFetchedTags([
        title.toLowerCase(),
        ...(s.genres ? s.genres.map((g: any) => g.description.toLowerCase()) : []),
      ]);
      setEditFormData((prev) => ({
        ...prev,
        title,
        slug,
        genre: genres,
        image_url: s.header_image || prev.image_url,
        description: s.short_description || prev.description,
      }));
    } catch (err: any) {
      setEditFormError(err?.message || "Failed to retrieve details from Steam.");
    } finally {
      setFetchingSteam(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setEditFormError("Please upload an image file.");
      return;
    }
    setUploadingImage(true);
    setEditFormError(null);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
      const filePath = `game-thumbnails/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("document-uploads")
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("document-uploads").getPublicUrl(filePath);
      setEditFormData((prev) => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      if (err?.message?.includes("Bucket not found") || err?.message?.includes("bucket_not_found")) {
        setEditFormError(
          "Storage bucket 'document-uploads' not found. Please create a public bucket named 'document-uploads' in your Supabase Storage dashboard."
        );
      } else {
        setEditFormError(err?.message || "Failed to upload image.");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleEditDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) await handleImageUpload(e.dataTransfer.files[0]);
  };

  const handleEditFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) await handleImageUpload(e.target.files[0]);
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormError(null);
    if (!editingGameId) return;
    if (!editFormData.title.trim()) return setEditFormError("Title is required.");
    if (!editFormData.slug.trim()) return setEditFormError("Slug is required.");
    if (!editFormData.image_url.trim()) return setEditFormError("Image URL/Poster is required.");
    if (!editFormData.genre.trim()) return setEditFormError("At least one genre is required.");

    const slugRegex = /^[a-z0-9-_]+$/;
    if (!slugRegex.test(editFormData.slug)) {
      return setEditFormError("Slug must contain only lowercase letters, numbers, hyphens, and underscores.");
    }

    setEditFormLoading(true);
    const parsedGame = {
      title: editFormData.title.trim(),
      slug: editFormData.slug.trim(),
      image_url: editFormData.image_url.trim(),
      selling_price: editFormData.selling_price.trim() !== "" ? Number(editFormData.selling_price) : null,
      original_price: editFormData.original_price.trim() !== "" ? Number(editFormData.original_price) : null,
      discount_percentage:
        editFormData.discount_percentage.trim() !== ""
          ? parseInt(editFormData.discount_percentage)
          : null,
      genre: editFormData.genre
        ? editFormData.genre.split(",").map((g) => g.trim()).filter(Boolean)
        : [],
      tags:
        fetchedTags.length > 0
          ? fetchedTags
          : editFormData.title
            ? editFormData.title
                .split(" ")
                .concat(editFormData.genre ? editFormData.genre.split(",").map((g) => g.trim()) : [])
            : [],
      series: editFormData.series.trim() || null,
      description: editFormData.description.trim() || null,
      release_status: editFormData.release_status,
      visible: editFormData.visible,
      steam_app_id: editFormData.steam_app_id.trim() !== "" ? parseInt(editFormData.steam_app_id) : null,
    };

    try {
      const { error: updateError } = await supabase
        .from("games")
        .update(parsedGame)
        .eq("id", editingGameId);
      if (updateError) throw updateError;
      setEditModalOpen(false);
      setEditingGameId(null);
      toast.success("Game listing updated");
      if (activeSectionId) loadSectionMappings(activeSectionId);
    } catch (err: any) {
      setEditFormError(err?.message || "Failed to save the game listing.");
    } finally {
      setEditFormLoading(false);
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
      {/* Section Tabs - Desktop */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex p-1 bg-background/60 border border-border rounded-xl overflow-x-auto max-w-fit">
          {sections.map((section) => {
            const isActive = !showCombos && activeSectionId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => { setShowCombos(false); setActiveSectionId(section.id); }}
                className={`px-4 py-2 text-sm font-bold tracking-wide transition-all rounded-lg cursor-pointer whitespace-nowrap ${
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
            className={`px-4 py-2 text-sm font-bold tracking-wide transition-all rounded-lg cursor-pointer whitespace-nowrap ${
              showCombos
                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,210,255,0.05)]"
                : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
            Value Combos
          </button>
        </div>
        <button
          onClick={() => setSectionsPanelOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          title="Open sections panel"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </div>

      {/* Section Selector - Mobile */}
      <div className="md:hidden flex justify-end">
        <button
          onClick={() => setSectionsPanelOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm font-bold text-white cursor-pointer"
        >
          {showCombos ? "Value Combos" : sections.find(s => s.id === activeSectionId)?.name || "Select Section"}
          <PanelRightOpen className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Mobile Sections Side Panel */}
      {sectionsPanelOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSectionsPanelOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-bold text-white">Sections</h3>
              <button
                onClick={() => setSectionsPanelOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {sections.map((section) => {
                const isActive = !showCombos && activeSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setShowCombos(false);
                      setActiveSectionId(section.id);
                      setSectionsPanelOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {section.name}
                  </button>
                );
              })}
              <div className="border-t border-border my-2" />
              <button
                onClick={() => {
                  setShowCombos(true);
                  setActiveSectionId(null);
                  setSectionsPanelOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  showCombos
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline-block mr-2 -mt-0.5" />
                Value Combos
              </button>
            </div>
          </div>
        </div>
      )}

      {showCombos ? (
        <CombosTab />
      ) : (
        <div className="space-y-4">
          {/* Toolbar — matches Value Combos layout */}
          <div className="bg-card border border-border p-3 lg:p-4 rounded-xl space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games in this section..."
                className="w-full bg-background/50 border border-border focus:border-primary rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => { setSelectedGameId(""); setActionError(null); setAddModalOpen(true); }}
                className="w-full sm:w-auto font-black active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Add Game
              </Button>
            </div>
          </div>

          {/* Full-width table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
            {mappingsLoading ? (
              <div className="h-72 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground font-medium">Updating section games...</p>
              </div>
            ) : mappings.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Home className="w-10 h-10 stroke-[1.25]" />
                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold">No games assigned to this section</p>
                  <p className="text-[10px] text-muted-foreground">Tap Add Game to assign listings</p>
                </div>
                <Button onClick={() => setAddModalOpen(true)} size="sm" className="font-black">
                  <Plus className="w-3.5 h-3.5" />
                  Add Game
                </Button>
              </div>
            ) : filteredMappings.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Search className="w-10 h-10 stroke-[1.25]" />
                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold">No games match your search</p>
                  <p className="text-[10px] text-muted-foreground">Try a different search term</p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-black/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="py-4 px-6 w-12"></th>
                        <th className="py-4 px-6 w-20">Image</th>
                        <th className="py-4 px-6">Title</th>
                        <th className="py-4 px-6 w-28">Price</th>
                        <th className="py-4 px-6 w-24">Discount</th>
                        <th className="py-4 px-6 w-28 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                      {paginatedMappings.map((mapping) => {
                        const fullIndex = mappings.findIndex((m) => m.id === mapping.id);
                        return (
                          <tr
                            key={mapping.id}
                            draggable={!searchQuery}
                            onDragStart={() => handleDragStart(fullIndex)}
                            onDragOver={(e) => handleDragOver(e, fullIndex)}
                            onDragEnd={handleDragEnd}
                            className="hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="py-3 px-6">
                              <div className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-4 h-4" />
                              </div>
                            </td>
                            <td className="py-3 px-6">
                              <div className="relative w-11 h-14 bg-black/30 rounded-md border border-border overflow-hidden shadow-sm">
                                <Image
                                  src={mapping.image_url}
                                  alt={mapping.title}
                                  fill
                                  sizes="44px"
                                  className="object-cover object-center"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-6">
                              <p className="font-bold text-white max-w-sm truncate" title={mapping.title}>{mapping.title}</p>
                              <p className="text-[10px] text-muted-foreground font-mono truncate">/{mapping.slug}</p>
                            </td>
                            <td className="py-3 px-6">
                              <p className="font-black text-white">₹{mapping.selling_price ?? 0}</p>
                              {mapping.original_price != null && mapping.original_price > (mapping.selling_price ?? 0) && (
                                <p className="text-xs text-muted-foreground line-through">₹{mapping.original_price}</p>
                              )}
                            </td>
                            <td className="py-3 px-6">
                              {mapping.discount_percentage != null && mapping.discount_percentage > 0 ? (
                                <span className="text-xs font-black bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded border border-blue-500/20">
                                  -{mapping.discount_percentage}%
                                </span>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center justify-center relative">
                                <button
                                  type="button"
                                  onClick={() => setOpenMenuId(openMenuId === mapping.id ? null : mapping.id)}
                                  className="p-2.5 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                                  title="More actions"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {openMenuId === mapping.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                    <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-card border border-border rounded-xl shadow-2xl py-1 overflow-hidden animate-slide-down">
                                      <button
                                        onClick={() => { openEditModal(mapping); setOpenMenuId(null); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                      >
                                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                                        Edit Game
                                      </button>
                                      <button
                                        onClick={() => { handleDirectToggleVisible(mapping); setOpenMenuId(null); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                      >
                                        {mapping.visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                                        {mapping.visible ? "Hide from Store" : "Show on Store"}
                                      </button>
                                      {isUpcomingSection && (
                                        <button
                                          disabled={actionLoading}
                                          onClick={() => { handleMoveToRecentlyLaunched(mapping); setOpenMenuId(null); }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                        >
                                          <Rocket className="w-4 h-4" />
                                          Move to Recently Launched
                                        </button>
                                      )}
                                      <div className="border-t border-border my-1" />
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => { setGameToDelete(mapping); setDeleteModalOpen(true); setOpenMenuId(null); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Remove
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border/60">
                  {paginatedMappings.map((mapping) => {
                    const fullIndex = mappings.findIndex((m) => m.id === mapping.id);
                    const isDragging = isMobileDragging(fullIndex);
                    const isDropTarget = isMobileDropTarget(fullIndex);
                    return (
                      <div
                        key={mapping.id}
                        ref={(el) => {
                          if (el) touchCardRefs.current.set(fullIndex, el);
                          else touchCardRefs.current.delete(fullIndex);
                        }}
                        className={`flex items-center gap-2 p-3 transition-all duration-150 ${
                          isDragging
                            ? "opacity-50 scale-[0.98] bg-primary/5"
                            : isDropTarget
                              ? "bg-primary/10 border-t-2 border-t-primary"
                              : ""
                        }`}
                      >
                        <div
                          onTouchStart={(e) => handleTouchStart(e, fullIndex)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          className={`flex-shrink-0 touch-none ${
                            searchQuery ? "opacity-30 pointer-events-none" : "cursor-grab active:cursor-grabbing"
                          }`}
                        >
                          <GripVertical className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                        <div className="relative w-12 h-16 flex-shrink-0 bg-black/30 rounded-md border border-border overflow-hidden shadow-sm">
                          <Image
                            src={mapping.image_url}
                            alt={mapping.title}
                            fill
                            sizes="48px"
                            className="object-cover object-center"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-white font-bold text-xs leading-tight truncate">{mapping.title}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-white">₹{mapping.selling_price ?? 0}</span>
                            {mapping.original_price != null && mapping.original_price > (mapping.selling_price ?? 0) && (
                              <span className="text-[10px] text-muted-foreground line-through">₹{mapping.original_price}</span>
                            )}
                            {mapping.discount_percentage != null && mapping.discount_percentage > 0 && (
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">-{mapping.discount_percentage}%</span>
                            )}
                          </div>
                        </div>
                         <div className="flex items-center flex-shrink-0">
                           <button
                             type="button"
                             onClick={() => setMobileActionMapping(mapping)}
                             className="p-2.5 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                             title="More actions"
                           >
                             <MoreVertical className="w-5 h-5" />
                           </button>
                         </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {filteredMappings.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 bg-black/5">
                    <p className="text-xs text-muted-foreground">
                      Showing <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span>–<span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, filteredMappings.length)}</span> of <span className="font-semibold text-white">{filteredMappings.length}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className="p-2.5 border border-border rounded-lg bg-background/50 text-muted-foreground hover:text-white hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="text-xs text-muted-foreground min-w-[80px] text-center">Page <span className="font-bold text-white">{currentPage}</span> of {totalPages}</span>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className="p-2.5 border border-border rounded-lg bg-background/50 text-muted-foreground hover:text-white hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Game Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-md bg-card border border-border sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-white">Add Game to Section</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 text-muted-foreground hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddGame} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Assign a catalog game to this homepage section. New games are appended to the bottom.
                </p>
                {actionError && (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-3 rounded-lg leading-relaxed">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{actionError}</span>
                  </div>
                )}
                <GamePicker
                  options={unmappedGames}
                  value={selectedGameId ? [selectedGameId] : []}
                  onChange={(ids) => setSelectedGameId(ids[0] || "")}
                  placeholder={unmappedGames.length === 0 ? "No unmapped games available" : "Search games to add..."}
                  label="Select Game"
                  single
                />
                {unmappedGames.length === 0 && (
                  <div className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] p-3 rounded-lg leading-relaxed">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>All visible storefront listings are already assigned to this section.</span>
                  </div>
                )}
              </div>
              <div className="border-t border-border p-4 bg-card flex justify-end gap-3 flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={actionLoading || !selectedGameId} className="font-black active:scale-[0.98]">
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Plus className="w-4 h-4" />
                  Assign to Section
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Action Sheet */}
      <MobileActionSheet
        open={!!mobileActionMapping}
        onOpenChange={(open) => { if (!open) setMobileActionMapping(null); }}
        title={mobileActionMapping?.title ?? ""}
        description={`ID: ${mobileActionMapping?.id?.slice(0, 8)}`}
        actions={
          mobileActionMapping
            ? [
                {
                  label: mobileActionMapping.visible ? "Hide from Store" : "Show on Store",
                  icon: mobileActionMapping.visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />,
                  onClick: () => handleDirectToggleVisible(mobileActionMapping),
                },
                {
                  label: "Edit Game",
                  icon: <Edit2 className="w-4 h-4 text-muted-foreground" />,
                  onClick: () => openEditModal(mobileActionMapping),
                },
                ...(isUpcomingSection ? [{
                  label: "Move to Recently Launched",
                  icon: <Rocket className="w-4 h-4 text-emerald-400" />,
                  onClick: () => handleMoveToRecentlyLaunched(mobileActionMapping),
                }] : []),
                {
                  label: "Remove",
                  icon: <Trash2 className="w-4 h-4" />,
                  variant: "destructive" as const,
                  disabled: actionLoading,
                  onClick: () => { setGameToDelete(mobileActionMapping); setDeleteModalOpen(true); },
                },
              ]
            : []
        }
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && gameToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-red-500/20 rounded-2xl shadow-2xl p-6 space-y-6 animate-scale-in">
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

      {/* Edit Game Modal */}
      <GameFormModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingGameId(null); }}
        mode="edit"
        formData={editFormData}
        onFormDataChange={setEditFormData}
        formError={editFormError}
        formLoading={editFormLoading}
        fetchingSteam={fetchingSteam}
        uploadingImage={uploadingImage}
        dragActive={dragActive}
        onSubmit={handleEditFormSubmit}
        onTitleChange={handleEditTitleChange}
        onFetchSteam={handleFetchSteam}
        onDrag={handleEditDrag}
        onDrop={handleEditDrop}
        onFileInput={handleEditFileInput}
      />
    </div>
  );
}
