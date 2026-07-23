"use client";

import { Search, X, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}: Props) {
  return (
    <div className="bg-[#111111] border border-[#262626] p-3 lg:p-4 rounded-xl space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, series, or slug..."
          className="w-full bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/10"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-white rounded transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={selectedGenre}
          onChange={(e) => onGenreChange(e.target.value)}
          className="flex-1 min-w-[130px] bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
        >
          {allGenres.map((g) => (
            <option key={g} value={g}>
              Genre: {g}
            </option>
          ))}
        </select>

        <select
          value={selectedVisibility}
          onChange={(e) => onVisibilityChange(e.target.value)}
          className="flex-1 min-w-[130px] bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
        >
          <option value="All">Visibility: All</option>
          <option value="Visible">Visible Only</option>
          <option value="Hidden">Hidden Only</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="flex-1 min-w-[130px] bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
        >
          <option value="All">Status: All</option>
          <option value="released">Released</option>
          <option value="upcoming">Upcoming</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "name" | "price" | "created")}
          className="flex-1 min-w-[110px] bg-[#050505]/50 border border-[#262626] focus:border-primary rounded-lg px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
        >
          <option value="name">Sort: Name</option>
          <option value="price">Sort: Price</option>
          <option value="created">Sort: Created</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg border border-[#262626] transition-all cursor-pointer"
            title="Clear all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}

        <Button onClick={onAdd} className="w-full sm:w-auto font-black active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Add Game
        </Button>
      </div>
    </div>
  );
}
