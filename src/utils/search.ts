import { Game } from "@/data/games";

export interface SearchFilters {
  query: string;
  genres: string[];
  priceRange?: { min: number; max: number };
  sortBy?: "price-low" | "price-high" | "name-az" | "name-za" | "discount";
}

/**
 * Fuzzy search games by query
 * Searches in: title, tags (case-insensitive, word boundary matching)
 */
export const searchGames = (games: Game[], query: string): Game[] => {
  if (!query || query.trim() === "") return games;

  const searchTerm = query.toLowerCase().trim();

  return games.filter((game) => {
    // Search in title (simple substring for titles)
    if (game.title.toLowerCase().includes(searchTerm)) return true;

    // Search in tags with word boundary matching
    // This prevents "raft" from matching "crafting"
    if (game.tags.some((tag) => {
      const tagLower = tag.toLowerCase();
      // Exact match
      if (tagLower === searchTerm) return true;
      // Word boundary match (starts with search term followed by space or is standalone word)
      if (tagLower.startsWith(searchTerm + " ")) return true;
      if (tagLower.endsWith(" " + searchTerm)) return true;
      if (tagLower.includes(" " + searchTerm + " ")) return true;
      return false;
    })) return true;

    // Search in genres (exact or starts with)
    if (game.genre.some((g) => {
      const genreLower = g.toLowerCase();
      return genreLower === searchTerm || genreLower.startsWith(searchTerm);
    })) return true;

    return false;
  });
};

/**
 * Filter games by genres
 */
export const filterByGenres = (games: Game[], genres: string[]): Game[] => {
  if (!genres || genres.length === 0) return games;

  return games.filter((game) =>
    genres.some((selectedGenre) => game.genre.includes(selectedGenre))
  );
};

/**
 * Filter games by price range
 */
export const filterByPriceRange = (
  games: Game[],
  range?: { min: number; max: number }
): Game[] => {
  if (!range) return games;

  return games.filter(
    (game) => game.price >= range.min && game.price <= range.max
  );
};

/**
 * Sort games by various criteria
 */
export const sortGames = (
  games: Game[],
  sortBy?: "price-low" | "price-high" | "name-az" | "name-za" | "discount"
): Game[] => {
  if (!sortBy) return games;

  const sorted = [...games];

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "name-za":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "discount":
      return sorted.sort((a, b) => {
        const discountA = parseInt(a.discount.replace(/[^\d]/g, ""));
        const discountB = parseInt(b.discount.replace(/[^\d]/g, ""));
        return discountB - discountA;
      });
    default:
      return sorted;
  }
};

/**
 * Main search function with all filters
 */
export const performSearch = (
  games: Game[],
  filters: SearchFilters
): Game[] => {
  let results = games;

  // Apply text search
  if (filters.query) {
    results = searchGames(results, filters.query);
  }

  // Apply genre filter
  if (filters.genres && filters.genres.length > 0) {
    results = filterByGenres(results, filters.genres);
  }

  // Apply price range filter
  if (filters.priceRange) {
    results = filterByPriceRange(results, filters.priceRange);
  }

  // Apply sorting
  if (filters.sortBy) {
    results = sortGames(results, filters.sortBy);
  }

  return results;
};

/**
 * Get search suggestions based on partial query
 * Returns top 5 matching games
 */
export const getSearchSuggestions = (
  games: Game[],
  query: string,
  limit: number = 5
): Game[] => {
  if (!query || query.trim() === "") return [];

  const results = searchGames(games, query);
  return results.slice(0, limit);
};

/**
 * Calculate match relevance score for sorting suggestions
 */
export const calculateRelevance = (game: Game, query: string): number => {
  const searchTerm = query.toLowerCase().trim();
  let score = 0;

  // Exact title match = highest score
  if (game.title.toLowerCase() === searchTerm) score += 100;

  // Title starts with query = high score
  if (game.title.toLowerCase().startsWith(searchTerm)) score += 50;

  // Title contains query = medium score
  if (game.title.toLowerCase().includes(searchTerm)) score += 25;

  // Tag exact match
  if (game.tags.includes(searchTerm)) score += 30;

  // Tag partial match
  if (game.tags.some((tag) => tag.includes(searchTerm))) score += 10;

  return score;
};
