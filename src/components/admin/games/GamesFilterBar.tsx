"use client";

import { useRef } from "react";
import { Search, X, RotateCcw, Plus, LayoutGrid, TableProperties } from "lucide-react";

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedGenre: string;
  onGenreChange: (value: string) => void;
  selectedVisibility: string;
  onVisibilityChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  sortBy: "name" | "price" | "created";
  onSortChange: (value: "name" | "price" | "created") => void;
  allGenres: string[];
  onReset: () => void;
  onAdd: () => void;
  hasActiveFilters: boolean;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
};

export default function GamesFilterBar({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  selectedVisibility,
  onVisibilityChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  allGenres,
  onReset,
  onAdd,
  hasActiveFilters,
  viewMode,
  onViewModeChange,
}: Props) {
  const genreScrollRef = useRef<HTMLDivElement>(null);

  const visibilityOptions = [
    { value: "All", label: "All" },
    { value: "Visible", label: "Live" },
    { value: "Hidden", label: "Hidden" },
  ];

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "released", label: "Released" },
    { value: "upcoming", label: "Upcoming" },
  ];

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "price", label: "Price" },
    { value: "created", label: "Newest" },
  ] as const;

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Add + View Toggle */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            id="games-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search title, series, slug..."
            className="w-full bg-[#0d0d0d] border border-[#1f1f1f] focus:border-white/30 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white focus:outline-none placeholder:text-muted-foreground/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-white rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="hidden md:flex items-center gap-0.5 bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-1 flex-shrink-0">
          <button
            id="view-mode-grid"
            onClick={() => onViewModeChange("grid")}
            title="Card grid view"
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-white/15 text-white shadow-sm"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            id="view-mode-table"
            onClick={() => onViewModeChange("table")}
            title="Table view"
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white/15 text-white shadow-sm"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <TableProperties className="w-4 h-4" />
          </button>
        </div>

        {hasActiveFilters && (
          <button
            id="games-reset-filters"
            onClick={onReset}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl border border-[#1f1f1f] transition-all cursor-pointer"
            title="Clear all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        <button
          id="games-add-btn"
          onClick={onAdd}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-white text-black font-black text-xs rounded-xl hover:bg-zinc-200 transition-all cursor-pointer active:scale-[0.98] shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Game</span>
        </button>
      </div>

      {/* Row 2: Visibility pill tabs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-1">
          {visibilityOptions.map((opt) => (
            <button
              key={opt.value}
              id={`visibility-${opt.value.toLowerCase()}`}
              onClick={() => onVisibilityChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedVisibility === opt.value
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              id={`status-${opt.value.toLowerCase()}`}
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedStatus === opt.value
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort selector — desktop only */}
        <div className="hidden sm:flex items-center gap-1 bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-1 ml-auto">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              id={`sort-${opt.value}`}
              onClick={() => onSortChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                sortBy === opt.value
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Genre scrollable pill tabs */}
      <div
        ref={genreScrollRef}
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5"
      >
        {allGenres.map((genre) => (
          <button
            key={genre}
            id={`genre-${genre.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => onGenreChange(genre)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedGenre === genre
                ? "bg-white text-black border-white shadow-md font-black"
                : "text-zinc-400 border-[#1f1f1f] hover:text-white hover:border-zinc-700 bg-[#0d0d0d]"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
