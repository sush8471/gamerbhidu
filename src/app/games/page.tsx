"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Footer from "@/components/sections/footer";
import {
  SlidersHorizontal,
  X,
  ShoppingCart,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  Tag,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import GamerBhiduNavbar from "@/components/sections/gamerbhidu-navbar";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getGames } from "@/lib/local-db";
import type { SortField, SortDir } from "@/lib/local-db";
import { Suspense } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 24;

type SortOption = {
  label: string;
  field: SortField;
  dir: SortDir;
};

const SORT_OPTIONS: SortOption[] = [
  { label: "Newest First", field: "created_at", dir: "desc" },
  { label: "Most Popular", field: "discount_percentage", dir: "desc" },
  { label: "Name: A to Z", field: "title", dir: "asc" },
  { label: "Name: Z to A", field: "title", dir: "desc" },
  { label: "Price: Low to High", field: "selling_price", dir: "asc" },
  { label: "Price: High to Low", field: "selling_price", dir: "desc" },
  { label: "Highest Discount", field: "discount_percentage", dir: "desc" },
];

const PRICE_RANGES = [
  { value: "all", label: "All Prices", min: undefined, max: undefined },
  { value: "free", label: "Free", min: 0, max: 0 },
  { value: "under-100", label: "Under ₹100", min: 1, max: 99 },
  { value: "100-300", label: "₹100 – ₹300", min: 100, max: 300 },
  { value: "300-500", label: "₹300 – ₹500", min: 300, max: 500 },
  { value: "above-500", label: "Above ₹500", min: 500, max: undefined },
];

const GENRE_ORDER = [
  "Action", "Adventure", "Open-World", "RPG", "FPS", "TPS",
  "Horror", "Survival", "Sports", "Racing", "Fighting",
  "Strategy", "Simulation", "Stealth", "Sci-Fi", "Fantasy",
  "Indie", "Puzzle", "Platformer", "Souls-like", "Co-op",
  "Metroidvania", "Roguelike", "Casual", "JRPG", "Sandbox",
  "Superhero", "Psychological", "Anime", "Zombie",
];

type Game = {
  id: string;
  title: string;
  image: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  genre: string[];
  slug: string;
};

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-card border border-white/10 text-white disabled:opacity-30 hover:bg-surface-elevated hover:border-white/20 transition-all disabled:cursor-not-allowed cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span key={`e-${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              currentPage === page
                ? "bg-white/15 text-white border border-white/20"
                : "bg-card border border-white/10 text-white hover:bg-surface-elevated hover:border-white/20"
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-card border border-white/10 text-white disabled:opacity-30 hover:bg-surface-elevated hover:border-white/20 transition-all disabled:cursor-not-allowed cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Game Card ─────────────────────────────────────────────────────────────────

function GameCard({ game, priority = false }: { game: Game; priority?: boolean }) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(game.slug || game.id);

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCart) {
      router.push("/cart");
    } else {
      addToCart({
        id: game.slug || game.id,
        name: game.title,
        price: game.price,
        image: game.image,
        originalPrice: game.originalPrice ?? game.price,
      });
    }
  };

  return (
    <div
      onClick={() => router.push(`/games/${game.slug || game.id}`)}
      className="group relative bg-card rounded-xl overflow-hidden border-0 transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={game.image}
          alt={game.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 14vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
        {game.discount && game.discount > 0 ? (
          <div className="absolute top-2 right-2 bg-white/15 text-white text-xs font-black px-2 py-1 rounded-md backdrop-blur-sm">
            -{game.discount}%
          </div>
        ) : null}
        {game.price === 0 ? (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-black px-2 py-1 rounded-md shadow-lg">
            FREE
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
      </div>
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <h3 className="text-foreground font-semibold text-sm leading-tight line-clamp-2 transition-colors">
          {game.title}
        </h3>
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-white font-black text-base">
            {game.price === 0 ? "Free" : `₹${game.price}`}
          </span>
          {game.originalPrice && game.originalPrice > game.price ? (
            <span className="text-muted-foreground text-xs line-through">₹{game.originalPrice}</span>
          ) : null}
        </div>
        <button
          onClick={handleCartClick}
          className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all mt-1 flex items-center justify-center gap-1.5 h-10 ${
            inCart
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
          }`}
        >
          {inCart ? (
            <span className="flex items-center justify-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> In Cart
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border-0 animate-pulse">
      <div className="aspect-[3/4] w-full bg-background-secondary" />
      <div className="p-2.5 space-y-2">
        <div className="h-4 bg-background-secondary rounded w-3/4" />
        <div className="h-3 bg-background-secondary rounded w-1/2" />
        <div className="h-7 bg-background-secondary rounded w-full mt-2" />
      </div>
    </div>
  );
}

// ─── Collapsible Filter Section ────────────────────────────────────────────────

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2 text-left group"
      >
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider group-hover:text-white transition-colors">
          {title}
        </span>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white transition-colors" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white transition-colors" />
        )}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

// ─── Main Browse Page ──────────────────────────────────────────────────────────

function BrowsePageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gridTopRef = useRef<HTMLDivElement>(null);

  const [games, setGames] = useState<Game[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allGenres, setAllGenres] = useState<string[]>([]);

  // Filter panel open/closed (collapsed by default to give grid max space)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllGenresMobile, setShowAllGenresMobile] = useState(false);

  // Filter state from URL
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => {
    const g = searchParams.get("genres");
    return g ? g.split(",").filter(Boolean) : [];
  });
  const [priceRange, setPriceRange] = useState<string>(() => searchParams.get("price") || "all");
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(() => searchParams.get("sale") === "1");
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get("q") || searchParams.get("search") || "");
  const [sortKey, setSortKey] = useState<string>(() => searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState<number>(() =>
    parseInt(searchParams.get("page") || "1", 10)
  );

  const currentSort = useMemo(
    () =>
      SORT_OPTIONS.find((s) => s.label.toLowerCase().replace(/\s/g, "-") === sortKey) ||
      SORT_OPTIONS[0],
    [sortKey]
  );

  const selectedPriceRange = useMemo(
    () => PRICE_RANGES.find((r) => r.value === priceRange) || PRICE_RANGES[0],
    [priceRange]
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // ── Fetch games ──
  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof getGames>[0] = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        sortBy: currentSort.field,
        sortDir: currentSort.dir,
      };
      if (selectedGenres.length > 0) params.genre = selectedGenres;
      if (selectedPriceRange.min !== undefined) params.minPrice = selectedPriceRange.min;
      if (selectedPriceRange.max !== undefined) params.maxPrice = selectedPriceRange.max;
      if (onSaleOnly) params.onSaleOnly = true;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const { data, count } = await getGames(params);
      const mapped: Game[] = (data || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        image: g.image_url,
        price: g.price ?? 0,
        originalPrice: g.original_price ?? null,
        discount: g.discount_percentage ?? null,
        genre: g.genre || [],
        slug: g.slug || "",
      }));
      setGames(mapped.filter((g) => g.title !== "Dead Island"));
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Failed to fetch games:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSort, selectedGenres, selectedPriceRange, onSaleOnly, searchQuery]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // ── Load genres once ──
  useEffect(() => {
    async function loadGenres() {
      const { data } = await getGames({ limit: 1000, visibleOnly: true });
      const set = new Set<string>();
      data?.forEach((g: any) => (g.genre || []).forEach((genre: string) => set.add(genre)));
      const sorted = Array.from(set).sort((a, b) => {
        const ai = GENRE_ORDER.indexOf(a);
        const bi = GENRE_ORDER.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
      });
      setAllGenres(sorted);
    }
    loadGenres();
  }, []);

  // ── URL update helper (driving state from URL) ──
  const updateFilters = useCallback((updates: {
    genres?: string[];
    price?: string;
    sale?: boolean;
    q?: string;
    sort?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.page === undefined && !updates.hasOwnProperty('page')) {
      params.delete("page");
    } else if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set("page", String(updates.page));
      } else {
        params.delete("page");
      }
    }

    if (updates.genres !== undefined) {
      if (updates.genres.length > 0) {
        params.set("genres", updates.genres.join(","));
      } else {
        params.delete("genres");
      }
    }

    if (updates.price !== undefined) {
      if (updates.price !== "all") {
        params.set("price", updates.price);
      } else {
        params.delete("price");
      }
    }

    if (updates.sale !== undefined) {
      if (updates.sale) {
        params.set("sale", "1");
      } else {
        params.delete("sale");
      }
    }

    if (updates.q !== undefined) {
      const trimmed = updates.q.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      params.delete("search"); // remove old fallback key
    }

    if (updates.sort !== undefined) {
      if (updates.sort !== "newest") {
        params.set("sort", updates.sort);
      } else {
        params.delete("sort");
      }
    }

    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // ── Sync local state with URL query parameters ──
  useEffect(() => {
    const genres = searchParams.get("genres");
    const parsedGenres = genres ? genres.split(",").filter(Boolean) : [];
    setSelectedGenres(parsedGenres);

    const price = searchParams.get("price") || "all";
    setPriceRange(price);

    const sale = searchParams.get("sale") === "1";
    setOnSaleOnly(sale);

    const urlQ = searchParams.get("q") || searchParams.get("search") || "";
    if (urlQ !== searchQuery) {
      setSearchQuery(urlQ);
    }

    const sort = searchParams.get("sort") || "newest";
    setSortKey(sort);

    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    updateFilters({ page });
    setTimeout(() => {
      gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const toggleGenre = (genre: string) => {
    const next = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    updateFilters({ genres: next });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    router.replace(pathname, { scroll: false });
  };

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      updateFilters({ q: value });
    }, 400);
  };

  const activeFilterCount =
    selectedGenres.length +
    (priceRange !== "all" ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background">
      <GamerBhiduNavbar />

      <div className="pt-6 pb-16">
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8">

          {/* ── Page Header & Compact Search ── */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white flex items-center gap-2 sm:gap-3">
                <LayoutGrid className="w-5 h-5 sm:w-7 sm:h-7 text-white/60" />
                Browse
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block mt-1">
                {loading ? "Loading..." : `${totalCount.toLocaleString()} games available`} · Original Steam games files · Instant delivery
              </p>
            </div>
          </div>

          {/* ── Top Control Bar (Hidden on mobile to save vertical space) ── */}
          <div
            ref={gridTopRef}
            className="hidden sm:flex flex-wrap items-center gap-3 mb-3 bg-card border border-border rounded-xl px-4 py-3"
          >
            {/* Filter Toggle Button (Desktop only) */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filtersOpen
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-card border border-white/5 text-muted-foreground hover:text-white hover:border-white/10"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className={`text-xs font-black w-5 h-5 rounded-full flex items-center justify-center ${
                    filtersOpen ? "bg-white text-black" : "bg-white/20 text-white"
                  }`}
                >
                  {activeFilterCount}
                </span>
              )}
              {filtersOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Result count */}
            <span className="text-muted-foreground text-sm flex-1 hidden sm:inline-block">
              {loading
                ? "Loading..."
                : `${totalCount.toLocaleString()} result${totalCount !== 1 ? "s" : ""}`}
              {currentPage > 1 && !loading && (
                <span className="ml-1 text-muted-foreground">
                  — Page {currentPage} of {totalPages}
                </span>
              )}
            </span>

            {/* Mobile Result Count Label */}
            <span className="text-muted-foreground text-sm flex-1 sm:hidden">
              {loading ? "Loading..." : `${totalCount.toLocaleString()} games`}
            </span>

            {/* Sort selector (Custom Dropdown Menu for Premium Styling) */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm hidden md:block">Sort:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-card border border-white/5 rounded-lg text-white text-sm hover:border-white/10 hover:text-white transition-all cursor-pointer">
                    <span className="text-muted-foreground text-xs sm:hidden">Sort:</span>
                    <span className="font-semibold">{currentSort.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border border-border text-white rounded-lg shadow-2xl p-1 w-48 z-50">
                  <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5 uppercase font-black tracking-wider">
                    Sort By
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuRadioGroup value={sortKey} onValueChange={(val) => updateFilters({ sort: val })}>
                    {SORT_OPTIONS.map((opt) => {
                      const key = opt.label.toLowerCase().replace(/\s/g, "-");
                      return (
                        <DropdownMenuRadioItem
                          key={key}
                          value={key}
                          className="flex items-center justify-between text-xs px-2 py-1.5 hover:bg-white/5 cursor-pointer rounded transition-colors text-muted-foreground data-[state=checked]:text-white data-[state=checked]:font-bold"
                        >
                          {opt.label}
                        </DropdownMenuRadioItem>
                      );
                    })}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ── Collapsible Filter Panel (Desktop only) ── */}
          <div
            className={`hidden sm:block overflow-hidden transition-all duration-300 ease-in-out ${
              filtersOpen ? "max-h-[600px] opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"
            }`}
          >
            <div className="bg-card border border-border rounded-xl p-5">
              {/* Filter Panel Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-bold text-sm">Filter Results</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-white/60 hover:text-white text-xs font-semibold transition-colors"
                  >
                    Clear all ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Filter Grid: 3 columns on desktop since Search is on the Top Control Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* ── Genre ── */}
                <FilterSection title="Genre">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 max-h-44 overflow-y-auto pr-1 scrollbar-hide">
                    {allGenres.map((genre) => {
                      const isChecked = selectedGenres.includes(genre);
                      return (
                        <label
                          key={genre}
                          onClick={() => toggleGenre(genre)}
                          className="flex items-center gap-2 py-1 cursor-pointer group"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isChecked
                                ? "bg-white/20 border-white/30"
                                : "border-white/10 group-hover:border-white/20"
                            }`}
                          >
                            {isChecked && <Check className="w-2 h-2 text-white" />}
                          </div>
                          <span
                            className={`text-xs transition-colors truncate ${
                              isChecked ? "text-white font-medium" : "text-muted-foreground group-hover:text-white"
                            }`}
                          >
                            {genre}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </FilterSection>

                {/* ── Price ── */}
                <FilterSection title="Price Range">
                  <div className="space-y-0.5">
                    {PRICE_RANGES.map((range) => {
                      const isSelected = priceRange === range.value;
                      return (
                        <label
                          key={range.value}
                          onClick={() => updateFilters({ price: range.value })}
                          className="flex items-center gap-2.5 py-1.5 cursor-pointer group"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected ? "border-white/40" : "border-white/10 group-hover:border-white/20"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span
                            className={`text-xs transition-colors ${
                              isSelected ? "text-white font-medium" : "text-muted-foreground group-hover:text-white"
                            }`}
                          >
                            {range.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </FilterSection>

                {/* ── Special Offers ── */}
                <FilterSection title="Special Offers">
                  <label
                    onClick={() => updateFilters({ sale: !onSaleOnly })}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                      onSaleOnly
                        ? "bg-white/10 border-white/20"
                        : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        onSaleOnly ? "bg-white/20 border-white/30" : "border-white/10"
                      }`}
                    >
                      {onSaleOnly && <Check className="w-2 h-2 text-white" />}
                    </div>
                    <Tag className={`w-3.5 h-3.5 ${onSaleOnly ? "text-white" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-medium ${onSaleOnly ? "text-white" : "text-muted-foreground"}`}>
                      On Sale Only
                    </span>
                  </label>
                </FilterSection>
              </div>
            </div>
          </div>

          {/* ── Active Filter Pills ── */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedGenres.map((genre) => (
                <div
                  key={genre}
                  className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-sm text-white"
                >
                  <span>{genre}</span>
                  <button
                    onClick={() => toggleGenre(genre)}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {priceRange !== "all" && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-sm text-white">
                  <span>{selectedPriceRange.label}</span>
                  <button
                    onClick={() => updateFilters({ price: "all" })}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {onSaleOnly && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-sm text-white">
                  <Tag className="w-3 h-3 text-white/60" />
                  <span>On Sale</span>
                  <button
                    onClick={() => updateFilters({ sale: false })}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {searchQuery.trim() && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-sm text-white">
                  <Search className="w-3 h-3 text-white/60" />
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button
                    onClick={() => handleSearchChange("")}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-white text-sm font-medium transition-colors px-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* ── Game Grid ── */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mb-4 border border-border">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">No games found</h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-xs">
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4">
                {games.map((game, idx) => (
                  <GameCard key={game.id} game={game} priority={idx < 4} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}

          {/* ── Mobile Floating Action Button (FAB) (Viewports < sm) ── */}
          <div className="fixed bottom-6 right-6 z-40 sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="relative w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center border border-white/20 active:scale-95 transition-all cursor-pointer">
                  <SlidersHorizontal className="w-6 h-6" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center bg-red-500 border-2 border-background text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-background border-l border-border p-5 text-white overflow-y-auto flex flex-col h-full z-50">
                <SheetHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                  <SheetTitle className="text-base font-black text-white">Filter & Sort</SheetTitle>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-white/60 hover:text-white text-xs font-semibold transition-colors mr-6"
                    >
                      Clear all
                    </button>
                  )}
                </SheetHeader>
                
                {/* Mobile Drawer Filter & Sort Sections */}
                <div className="flex-1 space-y-5 py-4 overflow-y-auto pr-1 scrollbar-hide">
                  
                  {/* Sort Options Integrated inside Drawer */}
                  <div>
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-2">
                      Sort By
                    </span>
                    <div className="space-y-1 bg-card border border-border rounded-xl p-3">
                      {SORT_OPTIONS.map((opt) => {
                        const key = opt.label.toLowerCase().replace(/\s/g, "-");
                        const isSelected = sortKey === key;
                        return (
                          <label
                            key={key}
                            onClick={() => updateFilters({ sort: key })}
                            className="flex items-center justify-between py-2.5 cursor-pointer group last:border-0 border-b border-white/5"
                          >
                            <span
                              className={`text-xs transition-colors ${
                                isSelected ? "text-white font-bold" : "text-muted-foreground group-hover:text-white"
                              }`}
                            >
                              {opt.label}
                             </span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected ? "border-white/40" : "border-white/10"
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Genre */}
                  <div className="border-t border-border pt-4">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-2">
                      Genre
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(showAllGenresMobile ? allGenres : allGenres.slice(0, 8)).map((genre) => {
                        const isChecked = selectedGenres.includes(genre);
                        return (
                          <label
                            key={genre}
                            onClick={() => toggleGenre(genre)}
                            className="flex items-center gap-2 py-1 cursor-pointer group"
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                                isChecked
                                  ? "bg-white/20 border-white/30"
                                  : "border-white/10 group-hover:border-white/20"
                              }`}
                            >
                              {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span
                              className={`text-xs transition-colors truncate ${
                              isChecked ? "text-white font-medium" : "text-muted-foreground group-hover:text-white"
                              }`}
                            >
                              {genre}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {allGenres.length > 8 && (
                      <button
                        onClick={() => setShowAllGenresMobile((v) => !v)}
                        className="text-white/60 hover:text-white text-xs font-semibold mt-2.5 transition-colors block text-left cursor-pointer"
                      >
                        {showAllGenresMobile ? "Show Less Genres" : `+ ${allGenres.length - 8} More Genres`}
                      </button>
                    )}
                  </div>

                  {/* Price Range */}
                  <div className="border-t border-border pt-3">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-2">
                      Price Range
                    </span>
                    <div className="space-y-1">
                      {PRICE_RANGES.map((range) => {
                        const isSelected = priceRange === range.value;
                        return (
                          <label
                            key={range.value}
                            onClick={() => updateFilters({ price: range.value })}
                            className="flex items-center gap-3 py-1.5 cursor-pointer group"
                          >
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected ? "border-white/40" : "border-white/10"
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span
                              className={`text-xs transition-colors ${
                                isSelected ? "text-white font-medium" : "text-muted-foreground"
                              }`}
                            >
                              {range.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Special Offers */}
                  <div className="border-t border-border pt-3 pb-8">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-2">
                      Special Offers
                    </span>
                    <label
                      onClick={() => updateFilters({ sale: !onSaleOnly })}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                      onSaleOnly
                        ? "bg-white/10 border-white/20"
                        : "border-white/5"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                        onSaleOnly ? "bg-white/20 border-white/30" : "border-white/10"
                        }`}
                      >
                        {onSaleOnly && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <Tag className={`w-4 h-4 ${onSaleOnly ? "text-white" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-bold ${onSaleOnly ? "text-white" : "text-muted-foreground"}`}>
                        On Sale Only
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-border mt-auto">
                  <SheetClose asChild>
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg transition-colors border border-white/20 cursor-pointer flex items-center justify-center gap-2">
                      {loading ? "Updating..." : `Show ${totalCount.toLocaleString()} Games`}
                    </button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <div className="pt-20 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </main>
      }
    >
      <BrowsePageInner />
    </Suspense>
  );
}
