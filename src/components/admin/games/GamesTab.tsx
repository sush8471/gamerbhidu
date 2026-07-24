"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import GamesFilterBar from "./GamesFilterBar";
import GamesTable from "./GamesTable";
import GameFormModal from "./GameFormModal";
import GameDeleteModal from "./GameDeleteModal";
import GameMobileActionSheet from "./GameMobileActionSheet";
import GamePagination from "./GamePagination";
import type { DbGame, GameFormData } from "@/types/game";

export default function GamesTab() {
  const searchParams = useSearchParams();

  // Data state
  const [games, setGames] = useState<DbGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "All");
  const [selectedVisibility, setSelectedVisibility] = useState(searchParams.get("visibility") || "All");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "All");
  const [sortBy, setSortBy] = useState<"name" | "price" | "created">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedGame, setSelectedGame] = useState<DbGame | null>(null);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<DbGame | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Mobile action sheet
  const [mobileActionGame, setMobileActionGame] = useState<DbGame | null>(null);

  // Visibility toggle
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<GameFormData>({
    title: "", slug: "", image_url: "",
    selling_price: "", original_price: "", discount_percentage: "",
    genre: "", series: "", description: "",
    release_status: "released", visible: true, steam_app_id: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Steam & upload state
  const [fetchingSteam, setFetchingSteam] = useState(false);
  const [fetchedTags, setFetchedTags] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Auto-calculate discount
  useEffect(() => {
    const sell = parseFloat(formData.selling_price);
    const orig = parseFloat(formData.original_price);
    if (!isNaN(sell) && !isNaN(orig) && orig > 0) {
      const pct = Math.round(((orig - sell) / orig) * 100);
      setFormData(prev => ({ ...prev, discount_percentage: pct > 0 ? pct.toString() : "" }));
    } else {
      setFormData(prev => ({ ...prev, discount_percentage: "" }));
    }
  }, [formData.selling_price, formData.original_price]);

  // Fetch games
  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("games")
        .select("*")
        .order("title", { ascending: true });
      if (fetchError) throw fetchError;
      setGames(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch games catalog.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGames(); }, [loadGames]);

  // Unique genres
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    games.forEach(g => g.genre?.forEach(genre => set.add(genre)));
    return ["All", ...Array.from(set).sort()];
  }, [games]);

  // Filter & sort
  const filteredGames = useMemo(() => {
    const filtered = games.filter(game => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = game.title.toLowerCase().includes(q) ||
        game.slug.toLowerCase().includes(q) ||
        (game.series && game.series.toLowerCase().includes(q));
      const matchesGenre = selectedGenre === "All" || game.genre?.includes(selectedGenre);
      const matchesVisibility = selectedVisibility === "All" ||
        (selectedVisibility === "Visible" && game.visible) ||
        (selectedVisibility === "Hidden" && !game.visible);
      const matchesStatus = selectedStatus === "All" || game.release_status === selectedStatus;
      return matchesSearch && matchesGenre && matchesVisibility && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "price") return (a.selling_price ?? 0) - (b.selling_price ?? 0);
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });
  }, [games, searchQuery, selectedGenre, selectedVisibility, selectedStatus, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage) || 1;
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGames.slice(start, start + itemsPerPage);
  }, [filteredGames, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedGenre, selectedVisibility, selectedStatus]);

  // Slug auto-generation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, title: val };
      if (modalMode === "add") {
        updated.slug = val.toLowerCase().trim()
          .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
      }
      return updated;
    });
  };

  // Steam autofill
  const handleFetchSteam = async () => {
    const appId = formData.steam_app_id.trim();
    if (!appId) { setFormError("Please enter a Steam App ID first."); return; }
    setFetchingSteam(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/steam?appId=${appId}`);
      if (!res.ok) throw new Error("Failed to fetch from Steam Store API.");
      const json = await res.json();
      const result = json[appId];
      if (!result?.success || !result.data) throw new Error("No data found for this Steam App ID.");
      const s = result.data;
      const title = s.name || "";
      const slug = title.toLowerCase().trim()
        .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
      const genres = s.genres ? s.genres.map((g: any) => g.description).join(", ") : "";
      setFetchedTags([title.toLowerCase(), ...(s.genres ? s.genres.map((g: any) => g.description.toLowerCase()) : [])]);
      setFormData(prev => ({
        ...prev,
        title, slug,
        genre: genres,
        image_url: s.header_image || prev.image_url,
        description: s.short_description || prev.description,
      }));
    } catch (err: any) {
      setFormError(err?.message || "Failed to retrieve details from Steam.");
    } finally {
      setFetchingSteam(false);
    }
  };

  // Image upload
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { setFormError("Please upload an image file."); return; }
    setUploadingImage(true);
    setFormError(null);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
      const filePath = `game-thumbnails/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("document-uploads").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("document-uploads").getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      if (err?.message?.includes("Bucket not found") || err?.message?.includes("bucket_not_found")) {
        setFormError("Storage bucket 'document-uploads' not found. Please create a public bucket named 'document-uploads' in your Supabase Storage dashboard.");
      } else {
        setFormError(err?.message || "Failed to upload image.");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) await handleImageUpload(e.dataTransfer.files[0]);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) await handleImageUpload(e.target.files[0]);
  };

  // Open add modal
  const openAddModal = () => {
    setModalMode("add");
    setSelectedGame(null);
    setFormData({
      title: "", slug: "", image_url: "",
      selling_price: "", original_price: "", discount_percentage: "",
      genre: "", series: "", description: "",
      release_status: "released", visible: true, steam_app_id: "",
    });
    setFormError(null);
    setModalOpen(true);
    setFetchedTags([]);
  };

  // Open edit modal
  const openEditModal = (game: DbGame) => {
    setModalMode("edit");
    setSelectedGame(game);
    setFormData({
      title: game.title,
      slug: game.slug,
      image_url: game.image_url,
      selling_price: game.selling_price !== null ? game.selling_price.toString() : "",
      original_price: game.original_price !== null ? game.original_price.toString() : "",
      discount_percentage: game.discount_percentage !== null ? game.discount_percentage.toString() : "",
      genre: game.genre ? game.genre.join(", ") : "",
      series: game.series || "",
      description: game.description || "",
      release_status: game.release_status,
      visible: game.visible,
      steam_app_id: game.steam_app_id !== null ? game.steam_app_id.toString() : "",
    });
    setFormError(null);
    setModalOpen(true);
    setFetchedTags([]);
  };

  const getSectionIdBySlug = async (slug: string) => {
    const { data: section, error } = await supabase
      .from("homepage_sections")
      .select("id")
      .eq("slug", slug)
      .single();
    if (error || !section) {
      throw new Error(error?.message || `Homepage section "${slug}" not found`);
    }
    return section.id as string;
  };

  const removeGameFromSection = async (gameId: string, sectionSlug: string) => {
    const sectionId = await getSectionIdBySlug(sectionSlug);
    const { error } = await supabase
      .from("section_games")
      .delete()
      .eq("section_id", sectionId)
      .eq("game_id", gameId);
    if (error) throw error;
  };

  const addGameToSection = async (gameId: string, sectionSlug: string) => {
    const sectionId = await getSectionIdBySlug(sectionSlug);

    const { data: existing, error: existingError } = await supabase
      .from("section_games")
      .select("id")
      .eq("section_id", sectionId)
      .eq("game_id", gameId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return;

    const { data: maxOrder, error: orderError } = await supabase
      .from("section_games")
      .select("display_order")
      .eq("section_id", sectionId)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (orderError) throw orderError;

    const { error: insertError } = await supabase.from("section_games").insert([
      {
        section_id: sectionId,
        game_id: gameId,
        display_order: (maxOrder?.display_order ?? 0) + 10,
      },
    ]);
    if (insertError) throw insertError;
  };

  // Sync homepage sections from release_status (and create path)
  const syncHomepageSectionsForGame = async (
    gameId: string,
    status: "released" | "upcoming",
    options: { isNew?: boolean; previousStatus?: "released" | "upcoming" } = {}
  ) => {
    if (status === "upcoming") {
      await addGameToSection(gameId, "upcoming-games");
      // Keep curated sections free of unreleased titles
      await removeGameFromSection(gameId, "recently-launched").catch(() => {});
      await removeGameFromSection(gameId, "hot-deals").catch(() => {});
      return;
    }

    // released
    await removeGameFromSection(gameId, "upcoming-games");

    // Auto-list new releases / status flips into Recently Launched
    if (options.isNew || options.previousStatus === "upcoming") {
      await addGameToSection(gameId, "recently-launched");
    }
  };

  // Form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.title.trim()) return setFormError("Title is required.");
    if (!formData.slug.trim()) return setFormError("Slug is required.");
    if (!formData.image_url.trim()) return setFormError("Image URL/Poster is required.");
    if (!formData.genre.trim()) return setFormError("At least one genre is required.");

    const slugRegex = /^[a-z0-9-_]+$/;
    if (!slugRegex.test(formData.slug)) {
      return setFormError("Slug must contain only lowercase letters, numbers, hyphens, and underscores.");
    }

    setFormLoading(true);

    const parsedGame: Partial<DbGame> = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      image_url: formData.image_url.trim(),
      selling_price: formData.selling_price.trim() !== "" ? Number(formData.selling_price) : null,
      original_price: formData.original_price.trim() !== "" ? Number(formData.original_price) : null,
      discount_percentage: formData.discount_percentage.trim() !== "" ? parseInt(formData.discount_percentage) : null,
      genre: formData.genre ? formData.genre.split(",").map(g => g.trim()).filter(Boolean) : [],
      tags: fetchedTags.length > 0 ? fetchedTags : formData.title ? formData.title.split(" ").concat(formData.genre ? formData.genre.split(",").map(g => g.trim()) : []) : [],
      series: formData.series.trim() || null,
      description: formData.description.trim() || null,
      release_status: formData.release_status,
      visible: formData.visible,
      steam_app_id: formData.steam_app_id.trim() !== "" ? parseInt(formData.steam_app_id) : null,
    };

    try {
      if (modalMode === "add") {
        const { data: created, error: insertError } = await supabase
          .from("games")
          .insert([parsedGame])
          .select("id")
          .single();
        if (insertError) throw insertError;
        if (!created?.id) throw new Error("Failed to get created game id");

        try {
          await syncHomepageSectionsForGame(created.id, formData.release_status, {
            isNew: true,
          });
        } catch (syncErr: any) {
          console.error("Failed to sync homepage sections:", syncErr);
          toast.error(
            syncErr?.message ||
              "Game saved, but failed to update homepage sections"
          );
        }
      } else {
        if (!selectedGame) return;
        const { error: updateError } = await supabase
          .from("games")
          .update(parsedGame)
          .eq("id", selectedGame.id);
        if (updateError) throw updateError;

        // Always re-sync when upcoming (idempotent repair); also on status change
        if (
          formData.release_status === "upcoming" ||
          selectedGame.release_status !== formData.release_status
        ) {
          try {
            await syncHomepageSectionsForGame(
              selectedGame.id,
              formData.release_status,
              { previousStatus: selectedGame.release_status }
            );
          } catch (syncErr: any) {
            console.error("Failed to sync homepage sections:", syncErr);
            toast.error(
              syncErr?.message ||
                "Game saved, but failed to update homepage sections"
            );
          }
        }
      }
      setModalOpen(false);
      toast.success(modalMode === "add" ? "Game listing created" : "Game listing updated");
      loadGames();
    } catch (err: any) {
      setFormError(err?.message || "Failed to save the game listing.");
    } finally {
      setFormLoading(false);
    }
  };

  // Visibility toggle
  const handleToggleVisible = async (game: DbGame) => {
    if (pendingToggleId === game.id) {
      setPendingToggleId(null);
      const updatedVisible = !game.visible;
      setGames(prev => prev.map(g => g.id === game.id ? { ...g, visible: updatedVisible } : g));
      try {
        const { error: updateError } = await supabase
          .from("games").update({ visible: updatedVisible }).eq("id", game.id);
        if (updateError) throw updateError;
        toast.success(updatedVisible ? "Game is now visible on storefront" : "Game is now hidden from storefront");
      } catch {
        setGames(prev => prev.map(g => g.id === game.id ? { ...g, visible: game.visible } : g));
        toast.error("Failed to update visibility");
      }
    } else {
      setPendingToggleId(game.id);
      setTimeout(() => setPendingToggleId(prev => prev === game.id ? null : prev), 3000);
    }
  };

  // Delete
  const openDeleteConfirm = (game: DbGame) => {
    setGameToDelete(game);
    setDeleteError(null);
    setDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!gameToDelete) return;
    setDeleteLoading(true);
    try {
      await supabase.from("section_games").delete().eq("game_id", gameToDelete.id);
      await supabase.from("combo_games").delete().eq("game_id", gameToDelete.id);
      const { error: deleteError } = await supabase.from("games").delete().eq("id", gameToDelete.id);
      if (deleteError) throw deleteError;
      setDeleteOpen(false);
      setGameToDelete(null);
      setDeleteError(null);
      toast.success("Game listing deleted");
      loadGames();
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete the game listing.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasActiveFilters = searchQuery !== "" || selectedGenre !== "All" ||
    selectedVisibility !== "All" || selectedStatus !== "All";

  return (
    <>
      <GamesFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        selectedVisibility={selectedVisibility}
        onVisibilityChange={setSelectedVisibility}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        allGenres={allGenres}
        onReset={() => {
          setSearchQuery("");
          setSelectedGenre("All");
          setSelectedVisibility("All");
          setSelectedStatus("All");
        }}
        onAdd={openAddModal}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
        <GamesTable
          loading={loading}
          error={error}
          filteredGames={filteredGames}
          paginatedGames={paginatedGames}
          pendingToggleId={pendingToggleId}
          onRetry={loadGames}
          onToggleVisibility={handleToggleVisible}
          onEdit={openEditModal}
          onDelete={openDeleteConfirm}
          onOpenMobileActions={setMobileActionGame}
          onAdd={openAddModal}
          hasActiveFilters={hasActiveFilters}
        />

        <GamePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredGames.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <GameFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        formData={formData}
        onFormDataChange={setFormData}
        formError={formError}
        formLoading={formLoading}
        fetchingSteam={fetchingSteam}
        uploadingImage={uploadingImage}
        dragActive={dragActive}
        onSubmit={handleFormSubmit}
        onTitleChange={handleTitleChange}
        onFetchSteam={handleFetchSteam}
        onDrag={handleDrag}
        onDrop={handleDrop}
        onFileInput={handleFileInput}
      />

      <GameDeleteModal
        open={deleteOpen}
        game={gameToDelete}
        loading={deleteLoading}
        error={deleteError}
        onCancel={() => { setDeleteOpen(false); setGameToDelete(null); }}
        onConfirm={handleDeleteSubmit}
      />

      <GameMobileActionSheet
        game={mobileActionGame}
        pendingToggleId={pendingToggleId}
        onOpenChange={(open) => !open && setMobileActionGame(null)}
        onToggleVisibility={handleToggleVisible}
        onEdit={openEditModal}
        onDelete={openDeleteConfirm}
      />
    </>
  );
}
