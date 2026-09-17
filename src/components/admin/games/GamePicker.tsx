"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Check, X } from "lucide-react";

type GameOption = {
  id: string;
  title: string;
};

type Props = {
  options: GameOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  label?: string;
  single?: boolean;
};

export default function GamePicker({
  options,
  value,
  onChange,
  placeholder = "Search games...",
  label,
  single = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter((g) => g.title.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (id: string) => {
    if (single) {
      onChange([id]);
      setOpen(false);
    } else {
      onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    }
  };

  const remove = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  const selectedTitles = useMemo(
    () => options.filter((o) => value.includes(o.id)),
    [options, value]
  );

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {label} <span className="text-muted-foreground font-normal normal-case">({value.length} selected)</span>
        </label>
      )}

      {!single && selectedTitles.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTitles.map((game) => (
            <span
              key={game.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 border border-white/15 text-white text-xs font-semibold rounded-md shadow-sm"
            >
              {game.title}
              <button
                type="button"
                onClick={() => remove(game.id)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#050505]/50 border border-[#262626] focus:border-white/40 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/10 placeholder:text-gray-600"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {open && (
          <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto bg-[#1a1a1a] border border-[#262626] rounded-xl shadow-2xl p-1.5 space-y-0.5">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No games match your search</p>
            ) : (
              filtered.map((game) => {
                const sel = value.includes(game.id);
                return (
                  <button
                    type="button"
                    key={game.id}
                    onClick={() => toggle(game.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      sel
                        ? "bg-white/10 border border-white/20 text-white font-semibold"
                        : "border border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                      sel ? "bg-white border-white text-black" : "border-[#262626] bg-[#050505]/50"
                    }`}>
                      {sel && <Check className="w-2.5 h-2.5 text-black" />}
                    </div>
                    <span className="truncate">{game.title}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
