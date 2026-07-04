/**
 * Local Game Database Queries
 * Uses local in-memory data
 */

import { GAMES_DATABASE } from "@/data/games";

export interface Game {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number | string;
    original_price?: number | null;
    discount_percentage?: number | null;
    image_url: string;
    genre: string[];
    tags: string[];
    steam_app_id?: number | null;
    series?: string | null;
}

// Convert GAMES_DATABASE format to Game format
const normalizeGame = (game: any): Game => ({
    id: game.id,
    title: game.title,
    slug: game.id, // Using id as slug
    description: game.description || "",
    price: game.price,
    original_price: game.originalPrice,
    discount_percentage: game.discount,
    image_url: game.image,
    genre: Array.isArray(game.genre) ? game.genre : [game.genre],
    tags: game.tags || [],
    steam_app_id: game.steamAppId || null,
    series: game.series || null,
});

/**
 * Search games by query
 */
export async function searchGames(query: string, limit: number = 50) {
    const normalizedQuery = query.toLowerCase().trim();

    const results = GAMES_DATABASE
        .filter(game =>
            game.title.toLowerCase().includes(normalizedQuery) ||
            game.genre?.some((g: string) => g.toLowerCase().includes(normalizedQuery)) ||
            game.tags?.some((t: string) => t.toLowerCase().includes(normalizedQuery))
        )
        .slice(0, limit)
        .map(normalizeGame);

    return { data: results, error: null };
}

/**
 * Get game by slug/id
 */
export async function getGameBySlug(slug: string) {
    const game = GAMES_DATABASE.find(g => g.id === slug);

    if (!game) {
        return { data: null, error: "Game not found" };
    }

    return { data: normalizeGame(game), error: null };
}

/**
 * Get games with filters
 */
export async function getGames(params: {
    genre?: string[];
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
} = {}) {
    let filtered = [...GAMES_DATABASE];

    // Filter by genre
    if (params.genre && params.genre.length > 0) {
        filtered = filtered.filter(game =>
            game.genre?.some((g: string) => params.genre!.includes(g))
        );
    }

    // Filter by tags
    if (params.tags && params.tags.length > 0) {
        filtered = filtered.filter(game =>
            game.tags?.some((t: string) => params.tags!.includes(t))
        );
    }

    // Filter by price
    if (params.minPrice !== undefined) {
        filtered = filtered.filter(game => Number(game.price) >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
        filtered = filtered.filter(game => Number(game.price) <= params.maxPrice!);
    }

    // Filter by search
    if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(game =>
            game.title.toLowerCase().includes(query)
        );
    }

    // Apply pagination
    const offset = params.offset || 0;
    const limit = params.limit || filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return { data: paginated.map(normalizeGame), error: null };
}

/**
 * Get total games count
 */
export async function getTotalGamesCount() {
    return { count: GAMES_DATABASE.length, error: null };
}

/**
 * Get all unique genres
 */
export function getAllGenres(): string[] {
    const genres = new Set<string>();
    GAMES_DATABASE.forEach(game => {
        if (Array.isArray(game.genre)) {
            game.genre.forEach(g => genres.add(g));
        } else if (game.genre) {
            genres.add(game.genre);
        }
    });
    return Array.from(genres).sort();
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
    const tags = new Set<string>();
    GAMES_DATABASE.forEach(game => {
        if (game.tags) {
            game.tags.forEach(t => tags.add(t));
        }
    });
    return Array.from(tags).sort();
}
