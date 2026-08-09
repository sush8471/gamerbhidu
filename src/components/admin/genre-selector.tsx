"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const AVAILABLE_GENRES = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Simulation",
  "Sports",
  "Racing",
  "Fighting",
  "Shooter",
  "Puzzle",
  "Platformer",
  "Stealth",
  "Survival",
  "Horror",
  "Open World",
  "MMO",
  "Battle Royale",
  "Roguelike",
  "Metroidvania",
  "Soulslike",
  "Sandbox",
  "Visual Novel",
  "Tower Defense",
  "Turn-Based",
  "Card Game",
  "Rhythm",
  "Party",
  "Educational",
];

const VISIBLE_MOBILE_COUNT = 8;

export default function GenreSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (genre: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);

  const currentGenres = useMemo(
    () => value.split(",").map((x) => x.trim()).filter(Boolean),
    [value]
  );

  const visibleGenres = showAll
    ? AVAILABLE_GENRES
    : AVAILABLE_GENRES.slice(0, VISIBLE_MOBILE_COUNT);

  const hasHidden = AVAILABLE_GENRES.length > VISIBLE_MOBILE_COUNT;
  const hiddenSelectedCount = useMemo(() => {
    if (showAll) return 0;
    return currentGenres.filter((g) => !visibleGenres.includes(g)).length;
  }, [currentGenres, visibleGenres, showAll]);

  const handleCheckboxChange = (g: string, checked: boolean) => {
    let updated;
    if (checked) {
      updated = [...currentGenres, g];
    } else {
      updated = currentGenres.filter((x) => x !== g);
    }
    const unique = Array.from(new Set(updated)).join(", ");
    onChange(unique);
  };

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Allot Genres / Categories <span className="text-red-500">*</span>
      </label>

      <div className="flex flex-wrap gap-2 pt-1">
        {visibleGenres.map((g) => {
          const isChecked = currentGenres.includes(g);
          return (
            <label
              key={g}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.97] ${
                isChecked
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_12px_rgba(0,210,255,0.1)]"
                  : "bg-background/30 border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleCheckboxChange(g, e.target.checked)}
                className="hidden"
              />
              <span>{g}</span>
            </label>
          );
        })}

        {hasHidden && (
          <button
            type="button"
            onClick={() => setShowAll((p) => !p)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all cursor-pointer"
          >
            {showAll ? (
              <><ChevronUp className="w-3 h-3" /><span>Show less</span></>
            ) : (
              <><ChevronDown className="w-3 h-3" /><span>Show all{hiddenSelectedCount > 0 ? ` (${hiddenSelectedCount} selected)` : ""}</span></>
            )}
          </button>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or enter custom genres manually (comma-separated, e.g. Platformer, VR)"
        className="w-full bg-background/50 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/10 placeholder:text-muted-foreground/50 font-mono"
      />
    </div>
  );
}
