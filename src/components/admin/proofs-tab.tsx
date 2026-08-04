"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  BadgeCheck, Search, Plus, Edit2, Trash2, Eye, EyeOff, X,
  Loader2, ChevronLeft, ChevronRight, AlertTriangle, Upload, FileImage, MoreVertical,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type DbProof = {
  id: string;
  image_url: string;
  label: string;
  tag: string;
  display_order: number;
  visible: boolean;
  created_at: string;
};

const DEFAULT_TAG = "Order Delivered";
const TAG_OPTIONS = ["Order Delivered", "Verified Deal", "Epic Deal"];

export default function ProofsTab() {
  const [proofs, setProofs] = useState<DbProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProof, setSelectedProof] = useState<DbProof | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [proofToDelete, setProofToDelete] = useState<DbProof | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: "",
    tag: DEFAULT_TAG,
    image_url: "",
    visible: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const loadProofs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("social_proofs")
        .select("*")
        .order("display_order", { ascending: true });
      if (fetchError) throw fetchError;
      setProofs(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch proofs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProofs();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [modalOpen]);

  const filteredProofs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return proofs.filter((p) =>
      p.label.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q)
    );
  }, [proofs, searchQuery]);

  const totalPages = Math.ceil(filteredProofs.length / itemsPerPage) || 1;
  const paginatedProofs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProofs.slice(start, start + itemsPerPage);
  }, [filteredProofs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const resetForm = () => {
    setFormData({ label: "", tag: DEFAULT_TAG, image_url: "", visible: true });
    setFormError(null);
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedProof(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (proof: DbProof) => {
    setModalMode("edit");
    setSelectedProof(proof);
    setFormData({
      label: proof.label || "",
      tag: proof.tag || DEFAULT_TAG,
      image_url: proof.image_url || "",
      visible: proof.visible,
    });
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
    if (!file.type.startsWith("image/")) {
      setFormError("Please upload an image file.");
      return;
    }
    setUploadingImage(true);
    setFormError(null);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
      const filePath = `proof-images/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("document-uploads")
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from("document-uploads")
        .getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
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

  const extractStoragePath = (url: string): string | null => {
    const marker = "/document-uploads/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const path = url.slice(idx + marker.length).split("?")[0];
    return path.startsWith("proof-images/") ? path : null;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.image_url.trim()) return setFormError("Image is required.");
    if (!formData.label.trim()) return setFormError("Label is required.");

    setFormLoading(true);

    const payload = {
      label: formData.label.trim(),
      tag: formData.tag.trim() || DEFAULT_TAG,
      image_url: formData.image_url.trim(),
      visible: formData.visible,
    };

    try {
      if (modalMode === "add") {
        const maxOrder = proofs.reduce((max, p) => Math.max(max, p.display_order), 0);
        const { error: insertError } = await supabase
          .from("social_proofs")
          .insert([{ ...payload, display_order: maxOrder + 1 }]);
        if (insertError) throw insertError;
      } else {
        if (!selectedProof) return;
        const { error: updateError } = await supabase
          .from("social_proofs")
          .update(payload)
          .eq("id", selectedProof.id);
        if (updateError) throw updateError;
      }

      setModalOpen(false);
      toast.success(modalMode === "add" ? "Proof added successfully" : "Proof updated successfully");
      loadProofs();
    } catch (err: any) {
      setFormError(err?.message || "Failed to save the proof.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDirectToggleVisible = async (proof: DbProof) => {
    const updated = !proof.visible;
    setProofs((prev) => prev.map((p) => (p.id === proof.id ? { ...p, visible: updated } : p)));
    try {
      const { error } = await supabase
        .from("social_proofs")
        .update({ visible: updated })
        .eq("id", proof.id);
      if (error) throw error;
      toast.success(updated ? "Proof is now visible on homepage" : "Proof is now hidden from homepage");
    } catch {
      setProofs((prev) => prev.map((p) => (p.id === proof.id ? { ...p, visible: proof.visible } : p)));
      toast.error("Failed to update visibility");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!proofToDelete) return;
    setDeleteLoading(true);
    try {
      const storagePath = extractStoragePath(proofToDelete.image_url);
      const { error } = await supabase
        .from("social_proofs")
        .delete()
        .eq("id", proofToDelete.id);
      if (error) throw error;

      if (storagePath) {
        await supabase.storage.from("document-uploads").remove([storagePath]);
      }

      setDeleteOpen(false);
      setProofToDelete(null);
      setDeleteError(null);
      toast.success("Proof deleted successfully");
      loadProofs();
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete the proof.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const showStart = Math.min((currentPage - 1) * itemsPerPage + 1, filteredProofs.length);
  const showEnd = Math.min(currentPage * itemsPerPage, filteredProofs.length);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border p-3 lg:p-4 rounded-xl space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proofs by label or tag..."
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
        <div className="flex justify-end">
          <Button onClick={openAddModal} className="w-full sm:w-auto font-black active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            Add Proof
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Loading proofs...</p>
          </div>
        ) : error ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <p className="text-sm text-gray-300 font-bold">{error}</p>
            <p className="text-xs text-muted-foreground max-w-md">
              If the table is missing, run the SQL in supabase/migrations/002_social_proofs.sql in your Supabase SQL Editor.
            </p>
            <Button onClick={loadProofs} variant="ghost" size="sm" className="mt-2 text-xs font-bold text-primary hover:underline">
              Retry
            </Button>
          </div>
        ) : filteredProofs.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <BadgeCheck className="w-12 h-12 stroke-[1.25]" />
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold">No proofs found</p>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Upload your first payment proof screenshot"}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-black text-xs rounded-lg hover:brightness-110 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Proof</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-border/60">
              {paginatedProofs.map((proof) => (
                <div key={proof.id} className="flex items-center gap-3 p-3">
                  <div className="relative w-14 h-20 flex-shrink-0 bg-black/20 rounded border border-border overflow-hidden">
                    {proof.image_url ? (
                      <Image src={proof.image_url} alt={proof.label} fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BadgeCheck className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-bold text-sm leading-tight truncate">{proof.label}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {proof.tag}
                      </span>
                      {!proof.visible && (
                        <span className="text-[10px] font-bold text-muted-foreground">Hidden</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center flex-shrink-0 relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === proof.id ? null : proof.id)}
                      className="p-2.5 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                      title="More actions"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenuId === proof.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-[#1a1a1a] border border-[#262626] rounded-xl shadow-2xl py-1 overflow-hidden animate-slide-down">
                          <button
                            onClick={() => { openEditModal(proof); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                            Edit Proof
                          </button>
                          <button
                            onClick={() => { handleDirectToggleVisible(proof); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            {proof.visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                            {proof.visible ? "Hide from Homepage" : "Show on Homepage"}
                          </button>
                          <div className="border-t border-[#262626] my-1" />
                          <button
                            onClick={() => { setProofToDelete(proof); setDeleteError(null); setDeleteOpen(true); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6 w-20">Image</th>
                    <th className="py-4 px-6">Label</th>
                    <th className="py-4 px-6 w-36">Tag</th>
                    <th className="py-4 px-6 w-24 text-center">Order</th>
                    <th className="py-4 px-6 w-28 text-center">Status</th>
                    <th className="py-4 px-6 w-28 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {paginatedProofs.map((proof) => (
                    <tr key={proof.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-6">
                        <div className="relative w-12 h-16 bg-black/20 rounded border border-border overflow-hidden">
                          {proof.image_url ? (
                            <Image src={proof.image_url} alt={proof.label} fill sizes="48px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BadgeCheck className="w-3 h-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <p className="font-bold text-foreground max-w-sm truncate" title={proof.label}>
                          {proof.label}
                        </p>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-xs font-black bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20">
                          {proof.tag}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center text-muted-foreground font-mono text-xs">
                        {proof.display_order}
                      </td>
                      <td className="py-3 px-6 text-center">
                        {proof.visible ? (
                          <span className="text-xs font-bold text-emerald-400">Visible</span>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">Hidden</span>
                        )}
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === proof.id ? null : proof.id)}
                            className="p-2.5 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === proof.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-[#1a1a1a] border border-[#262626] rounded-xl shadow-2xl py-1 overflow-hidden animate-slide-down">
                                <button
                                  onClick={() => { openEditModal(proof); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                                  Edit Proof
                                </button>
                                <button
                                  onClick={() => { handleDirectToggleVisible(proof); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                  {proof.visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                                  {proof.visible ? "Hide" : "Show"}
                                </button>
                                <div className="border-t border-[#262626] my-1" />
                                <button
                                  onClick={() => { setProofToDelete(proof); setDeleteError(null); setDeleteOpen(true); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && filteredProofs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 bg-black/5">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{showStart}</span>-
              <span className="font-semibold text-foreground">{showEnd}</span> of{" "}
              <span className="font-semibold text-foreground">{filteredProofs.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-2.5 border border-border rounded-lg bg-background text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground min-w-[80px] text-center">
                Page <span className="font-bold text-foreground">{currentPage}</span> of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-2.5 border border-border rounded-lg bg-background text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden animate-fade-in">
          <div className="w-full h-full sm:h-auto sm:max-w-lg bg-card border-0 sm:border border-border sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[90vh] animate-scale-in">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-foreground">
                {modalMode === "add" ? "Add Proof" : "Edit Proof"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
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
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Image <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("proof-file-upload")?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden h-48 bg-background/50 ${
                      dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="file"
                      id="proof-file-upload"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <p className="text-[10px] text-muted-foreground">Uploading...</p>
                      </div>
                    ) : formData.image_url ? (
                      <>
                        <div className="absolute inset-0 z-0">
                          <Image src={formData.image_url} alt="" fill className="object-contain p-2" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-1 mt-auto mb-2">
                          <FileImage className="w-5 h-5 text-primary drop-shadow" />
                          <p className="text-[10px] text-foreground font-bold bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                            Click or drop to change
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <p className="text-[10px] text-foreground font-bold">Drag & drop screenshot or click to browse</p>
                      </>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                    placeholder="Or paste image URL"
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/50 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g. Cyberpunk & Mafia Deal"
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Tag</label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
                  >
                    {TAG_OPTIONS.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                    placeholder="Or type a custom tag"
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="border-t border-border pt-5">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => setFormData((prev) => ({ ...prev, visible: e.target.checked }))}
                      className="w-4 h-4 rounded border-border accent-primary"
                    />
                    <span>Visible on homepage</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-border p-4 bg-card flex justify-end gap-3 flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading || uploadingImage} className="font-black active:scale-[0.98]">
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modalMode === "add" ? "Save Proof" : "Update Proof"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-red-500/20 rounded-2xl shadow-2xl p-6 space-y-6 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Delete Proof?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Delete <span className="text-foreground font-semibold">&quot;{proofToDelete?.label}&quot;</span>?
                  This cannot be undone.
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
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteOpen(false);
                  setProofToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSubmit}
                disabled={deleteLoading}
                className="active:scale-[0.98]"
              >
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
