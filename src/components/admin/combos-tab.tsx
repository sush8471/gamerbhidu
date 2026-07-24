"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Layers, Search, Plus, Edit2, Trash2, Eye, EyeOff, X,
  Loader2, ChevronLeft, ChevronRight, AlertTriangle, Upload, FileImage,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import GamePicker from "@/components/admin/games/GamePicker";

type DbCombo = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  original_price: number | null;
  discounted_price: number;
  discount_details: string | null;
  curiosity_cue: string | null;
  value_anchor: string | null;
  display_order: number;
  visible: boolean;
  deal_expires_at: string | null;
  created_at: string;
};

type DbGame = { id: string; title: string };

export default function CombosTab() {
  const [combos, setCombos] = useState<DbCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortBy, setSortBy] = useState<"name" | "price">("name");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCombo, setSelectedCombo] = useState<DbCombo | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [comboToDelete, setComboToDelete] = useState<DbCombo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    curiosity_cue: "",
    value_anchor: "",
    image_url: "",
    original_price: "",
    discounted_price: "",
    deal_expires_at: "",
    visible: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [games, setGames] = useState<DbGame[]>([]);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);

  const autoDiscountBadge = useMemo(() => {
    const orig = parseFloat(formData.original_price);
    const disc = parseFloat(formData.discounted_price);
    if (!isNaN(orig) && !isNaN(disc) && orig > disc && orig > 0) {
      const pct = Math.round(((orig - disc) / orig) * 100);
      return pct > 0 ? `-${pct}%` : "";
    }
    return "";
  }, [formData.original_price, formData.discounted_price]);

  const loadCombos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("combos")
        .select("*")
        .order("display_order", { ascending: true });
      if (fetchError) throw fetchError;
      setCombos(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch combos.");
    } finally {
      setLoading(false);
    }
  };

  const loadGames = async () => {
    try {
      const { data } = await supabase
        .from("games")
        .select("id, title")
        .order("title", { ascending: true });
      setGames(data || []);
    } catch (err) {
      console.error("Failed to load games:", err);
    }
  };

  const loadComboGames = async (comboId: string) => {
    try {
      const { data } = await supabase
        .from("combo_games")
        .select("game_id")
        .eq("combo_id", comboId)
        .order("display_order", { ascending: true });
      setSelectedGameIds((data || []).map((cg: any) => cg.game_id));
    } catch (err) {
      console.error("Failed to load combo games:", err);
    }
  };

  useEffect(() => {
    loadCombos();
    loadGames();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [modalOpen]);

  const filteredCombos = useMemo(() => {
    const filtered = combos.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return a.discounted_price - b.discounted_price;
    });
  }, [combos, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredCombos.length / itemsPerPage) || 1;
  const paginatedCombos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCombos.slice(start, start + itemsPerPage);
  }, [filteredCombos, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const resetForm = () => {
    setFormData({ title: "", description: "", curiosity_cue: "", value_anchor: "", image_url: "", original_price: "", discounted_price: "", deal_expires_at: "", visible: true });
    setSelectedGameIds([]);
    setFormError(null);
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedCombo(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = async (combo: DbCombo) => {
    setModalMode("edit");
    setSelectedCombo(combo);
    const localExpiry = combo.deal_expires_at
      ? new Date(combo.deal_expires_at).toISOString().slice(0, 16)
      : "";
    setFormData({
      title: combo.title,
      description: combo.description || "",
      curiosity_cue: combo.curiosity_cue || "",
      value_anchor: combo.value_anchor || "",
      image_url: combo.image_url || "",
      original_price: combo.original_price !== null ? combo.original_price.toString() : "",
      discounted_price: combo.discounted_price.toString(),
      deal_expires_at: localExpiry,
      visible: combo.visible,
    });
    await loadComboGames(combo.id);
    setFormError(null);
    setModalOpen(true);
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

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { setFormError("Please upload an image file."); return; }
    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
      const filePath = `combo-images/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("document-uploads")
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from("document-uploads")
        .getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      if (err?.message?.includes("Bucket not found") || err?.message?.includes("bucket_not_found")) {
        setFormError("Storage bucket 'document-uploads' not found. Create a public bucket named 'document-uploads' in Supabase Storage.");
      } else {
        setFormError(err?.message || "Failed to upload image.");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.title.trim()) return setFormError("Title is required.");
    if (!formData.discounted_price.trim()) return setFormError("Discounted price is required.");

    setFormLoading(true);

    const origNum = formData.original_price.trim() !== "" ? Number(formData.original_price) : null;
    const discNum = Number(formData.discounted_price);
    let discBadge = autoDiscountBadge || null;

    const parsedCombo: any = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      curiosity_cue: formData.curiosity_cue.trim() || null,
      value_anchor: formData.value_anchor.trim() || null,
      image_url: formData.image_url.trim() || null,
      original_price: origNum,
      discounted_price: discNum,
      discount_details: discBadge,
      deal_expires_at: formData.deal_expires_at
        ? new Date(formData.deal_expires_at).toISOString()
        : null,
      visible: formData.visible,
    };

    try {
      let comboId: string;

      if (modalMode === "add") {
        const maxOrder = combos.reduce((max, c) => Math.max(max, c.display_order), 0);
        parsedCombo.display_order = maxOrder + 1;
        const { data, error: insertError } = await supabase
          .from("combos").insert([parsedCombo]).select("id").single();
        if (insertError) throw insertError;
        comboId = data.id;
      } else {
        if (!selectedCombo) return;
        comboId = selectedCombo.id;
        const { error: updateError } = await supabase
          .from("combos").update(parsedCombo).eq("id", comboId);
        if (updateError) throw updateError;
        await supabase.from("combo_games").delete().eq("combo_id", comboId);
      }

      if (selectedGameIds.length > 0) {
        const rows = selectedGameIds.map((gameId, i) => ({
          combo_id: comboId, game_id: gameId, display_order: i + 1,
        }));
        const { error: linkError } = await supabase.from("combo_games").insert(rows);
        if (linkError) throw linkError;
      }

      setModalOpen(false);
      toast.success(modalMode === "add" ? "Combo created successfully" : "Combo updated successfully");
      loadCombos();
    } catch (err: any) {
      setFormError(err?.message || "Failed to save the combo.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleVisible = async (combo: DbCombo) => {
    if (pendingToggleId === combo.id) {
      setPendingToggleId(null);
      const updated = !combo.visible;
      setCombos(prev => prev.map(c => c.id === combo.id ? { ...c, visible: updated } : c));
      try {
        const { error } = await supabase.from("combos").update({ visible: updated }).eq("id", combo.id);
        if (error) throw error;
        toast.success(updated ? "Combo is now visible on storefront" : "Combo is now hidden from storefront");
      } catch {
        setCombos(prev => prev.map(c => c.id === combo.id ? { ...c, visible: combo.visible } : c));
        toast.error("Failed to update visibility");
      }
    } else {
      setPendingToggleId(combo.id);
      setTimeout(() => setPendingToggleId(prev => prev === combo.id ? null : prev), 3000);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!comboToDelete) return;
    setDeleteLoading(true);
    try {
      await supabase.from("combo_games").delete().eq("combo_id", comboToDelete.id);
      const { error } = await supabase.from("combos").delete().eq("id", comboToDelete.id);
      if (error) throw error;
      setDeleteOpen(false);
      setComboToDelete(null);
      setDeleteError(null);
      toast.success("Combo deleted successfully");
      loadCombos();
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete the combo.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const showStart = Math.min((currentPage - 1) * itemsPerPage + 1, filteredCombos.length);
  const showEnd = Math.min(currentPage * itemsPerPage, filteredCombos.length);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border p-3 lg:p-4 rounded-xl space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search combos..."
            className="w-full bg-background border border-border focus:border-primary rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "price")}
            className="bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
          >
            <option value="name">Sort: Name</option>
            <option value="price">Sort: Price</option>
          </select>
          <Button onClick={openAddModal} className="w-full sm:w-auto font-black active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            Add Combo
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Loading combos...</p>
          </div>
        ) : error ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <p className="text-sm text-gray-300 font-bold">{error}</p>
            <Button onClick={loadCombos} variant="ghost" size="sm" className="mt-2 text-xs font-bold text-primary hover:underline">Retry</Button>
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Layers className="w-12 h-12 stroke-[1.25]" />
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold">No combos found</p>
              <p className="text-xs text-muted-foreground">{searchQuery ? "Try a different search term" : "Create your first combo deal"}</p>
            </div>
            {!searchQuery && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-black text-xs rounded-lg hover:brightness-110 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Combo</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile list */}
            <div className="md:hidden divide-y divide-border/60">
              {paginatedCombos.map((combo) => (
                <div key={combo.id} className="flex items-center gap-3 p-3">
                  <div className="relative w-14 h-10 flex-shrink-0 bg-black/20 rounded border border-border overflow-hidden">
                    {combo.image_url ? (
                      <Image src={combo.image_url} alt={combo.title} fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Layers className="w-4 h-4 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-bold text-sm leading-tight truncate">{combo.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-foreground">{"\u20B9"}{combo.discounted_price}</span>
                      {combo.original_price && (
                        <span className="text-xs text-muted-foreground line-through">{"\u20B9"}{combo.original_price}</span>
                      )}
                      {combo.discount_details && (
                        <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">{combo.discount_details}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleToggleVisible(combo)} className={`p-2 rounded transition-all cursor-pointer ${pendingToggleId === combo.id ? "text-amber-400 bg-amber-500/10" : combo.visible ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {pendingToggleId === combo.id ? <AlertTriangle className="w-4 h-4" /> : combo.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEditModal(combo)} className="p-2 text-muted-foreground hover:text-primary rounded transition-all cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { setComboToDelete(combo); setDeleteError(null); setDeleteOpen(true); }} className="p-2 text-muted-foreground hover:text-red-400 rounded transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6 w-16">Image</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6 w-32">Price</th>
                    <th className="py-4 px-6 w-24">Discount</th>
                    <th className="py-4 px-6 w-28 text-center">Visibility</th>
                    <th className="py-4 px-6 w-28 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {paginatedCombos.map((combo) => (
                    <tr key={combo.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-6">
                        <div className="relative w-12 h-8 bg-black/20 rounded border border-border overflow-hidden">
                          {combo.image_url ? (
                            <Image src={combo.image_url} alt={combo.title} fill sizes="48px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Layers className="w-3 h-3 text-muted-foreground" /></div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <p className="font-bold text-foreground max-w-sm truncate" title={combo.title}>{combo.title}</p>
                      </td>
                      <td className="py-3 px-6">
                        <p className="font-black text-foreground">{"\u20B9"}{combo.discounted_price}</p>
                        {combo.original_price && <p className="text-xs text-muted-foreground line-through">{"\u20B9"}{combo.original_price}</p>}
                      </td>
                      <td className="py-3 px-6">
                        {combo.discount_details ? (
                          <span className="text-xs font-black bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded border border-blue-500/20">{combo.discount_details}</span>
                        ) : <span className="text-xs text-muted-foreground">-</span>}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => handleToggleVisible(combo)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                            pendingToggleId === combo.id
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : combo.visible ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-gray-500/10 text-muted-foreground border border-gray-500/20 hover:text-foreground"
                          }`}
                        >
                          {pendingToggleId === combo.id ? (
                            <><AlertTriangle className="w-3.5 h-3.5" /><span>Confirm?</span></>
                          ) : combo.visible ? (
                            <><Eye className="w-3.5 h-3.5" /><span>Visible</span></>
                          ) : (
                            <><EyeOff className="w-3.5 h-3.5" /><span>Hidden</span></>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center gap-2.5">
                          <button onClick={() => openEditModal(combo)} className="p-2.5 text-muted-foreground hover:text-primary hover:bg-white/5 rounded transition-all cursor-pointer" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => { setComboToDelete(combo); setDeleteError(null); setDeleteOpen(true); }} className="p-2.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/5 rounded transition-all cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && filteredCombos.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 bg-black/5">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{showStart}</span>-<span className="font-semibold text-foreground">{showEnd}</span> of <span className="font-semibold text-foreground">{filteredCombos.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className="p-2.5 border border-border rounded-lg bg-background text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-muted-foreground min-w-[80px] text-center">Page <span className="font-bold text-foreground">{currentPage}</span> of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className="p-2.5 border border-border rounded-lg bg-background text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="w-full h-full sm:h-auto sm:max-w-lg bg-card border-0 sm:border border-border sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[90vh] animate-fadeIn">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-foreground">{modalMode === "add" ? "Add Combo Deal" : "Edit Combo Deal"}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain p-6 space-y-5">
                {formError && (
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg leading-relaxed">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text" required value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Fighting Combo"
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                  <textarea
                    rows={2} value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. Best fighting bundle including 5 top-rated Steam games"
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Curiosity Cue</label>
                  <input
                    type="text" value={formData.curiosity_cue}
                    onChange={(e) => setFormData(prev => ({ ...prev, curiosity_cue: e.target.value }))}
                    placeholder="e.g. Grab these 5 fighting games before this offer ends!"
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Value Anchor</label>
                  <input
                    type="text" value={formData.value_anchor}
                    onChange={(e) => setFormData(prev => ({ ...prev, value_anchor: e.target.value }))}
                    placeholder="e.g. 1799 worth of games for just 199"
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Image</label>
                  <div
                    onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                    onClick={() => document.getElementById("combo-file-upload")?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden h-36 bg-background/50 ${
                      dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input type="file" id="combo-file-upload" accept="image/*" onChange={handleFileInput} className="hidden" />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <p className="text-[10px] text-muted-foreground">Uploading...</p>
                      </div>
                    ) : formData.image_url ? (
                      <>
                        <div className="absolute inset-0 z-0 opacity-30 blur-sm scale-110">
                          <Image src={formData.image_url} alt="" fill className="object-cover" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-1">
                          <FileImage className="w-6 h-6 text-primary" />
                          <p className="text-[10px] text-foreground font-bold bg-black/60 px-2 py-0.5 rounded-full border border-white/10">Click or drop to change</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <p className="text-[10px] text-foreground font-bold">Drag & drop image or click to browse</p>
                      </>
                    )}
                  </div>
                  <input
                    type="text" value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="Or paste image URL"
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/50 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Original Price</label>
                    <input
                      type="number" value={formData.original_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                      placeholder="1799"
                      className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Selling Price <span className="text-red-500">*</span></label>
                    <input
                      type="number" required value={formData.discounted_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, discounted_price: e.target.value }))}
                      placeholder="199"
                      className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Discount Badge (auto)</label>
                  <input
                    type="text" disabled
                    value={autoDiscountBadge || "Enter both prices to calculate"}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Limited Time Deal Expiry</label>
                  <input
                    type="datetime-local"
                    value={formData.deal_expires_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, deal_expires_at: e.target.value }))}
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground">Leave empty for a permanent deal. Combo will auto-hide after expiry.</p>
                </div>

                <div className="border-t border-border pt-5">
                  <GamePicker
                    options={games}
                    value={selectedGameIds}
                    onChange={setSelectedGameIds}
                    placeholder="Search games to include..."
                    label="Include Games"
                  />
                </div>

                <div className="border-t border-border pt-5">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                    <input type="checkbox" checked={formData.visible} onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))} className="w-4 h-4 rounded border-border accent-primary" />
                    <span>Visible on storefront</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-border p-4 bg-card flex justify-end gap-3 flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={formLoading} className="font-black active:scale-[0.98]">
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modalMode === "add" ? "Save Combo" : "Update Combo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-red-500/20 rounded-2xl shadow-2xl p-6 space-y-6 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Delete Combo?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Delete <span className="text-foreground font-semibold">"{comboToDelete?.title}"</span> and all its game links? This cannot be undone.
                </p>
              </div>
            </div>
            {deleteError && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg leading-relaxed">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setDeleteOpen(false); setComboToDelete(null); }}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteSubmit} disabled={deleteLoading} className="active:scale-[0.98]">
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
