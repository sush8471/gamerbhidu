/**
 * Local Game Database Queries
 * Abstraction layer querying Supabase database
 */

import { supabase } from "@/lib/supabase";

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

// Convert Supabase database row format to Game format
const normalizeDbGame = (dbGame: any): Game => ({
    id: dbGame.id,
    title: dbGame.title,
    slug: dbGame.slug,
    description: dbGame.description || "",
    price: dbGame.selling_price ?? 0,
    original_price: dbGame.original_price,
    discount_percentage: dbGame.discount_percentage,
    image_url: dbGame.image_url,
    genre: dbGame.genre || [],
    tags: dbGame.tags || [],
    steam_app_id: dbGame.steam_app_id,
    series: dbGame.series,
});

/**
 * Search games by query (for suggestions)
 */
export async function searchGames(query: string, limit: number = 50) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return { data: [], error: null };

    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('visible', true)
        .or(`title.ilike.%${cleanQuery}%,series.ilike.%${cleanQuery}%`)
        .limit(limit);

    if (error) {
        return { data: [], error: error.message };
    }

    return { data: (data || []).map(normalizeDbGame), error: null };
}

/**
 * Get game by slug/id
 */
export async function getGameBySlug(slug: string) {
    // Check if input slug is a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    const query = supabase.from('games').select('*');
    if (isUuid) {
        query.or(`id.eq.${slug},slug.eq.${slug}`);
    } else {
        query.eq('slug', slug);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
        return { data: null, error: error.message };
    }
    if (!data) {
        return { data: null, error: "Game not found" };
    }

    return { data: normalizeDbGame(data), error: null };
}

export type SortField = 'title' | 'selling_price' | 'discount_percentage' | 'created_at';
export type SortDir = 'asc' | 'desc';

/**
 * Get games with filters
 */
export async function getGames(params: {
    genre?: string[];
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    onSaleOnly?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    visibleOnly?: boolean;
    sortBy?: SortField;
    sortDir?: SortDir;
} = {}) {
    let query = supabase.from('games').select('*', { count: 'exact' });

    if (params.visibleOnly !== false) {
        query = query.eq('visible', true);
    }

    if (params.genre && params.genre.length > 0) {
        query = query.overlaps('genre', params.genre);
    }

    if (params.tags && params.tags.length > 0) {
        query = query.overlaps('tags', params.tags);
    }

    if (params.minPrice !== undefined) {
        query = query.gte('selling_price', params.minPrice);
    }

    if (params.maxPrice !== undefined) {
        query = query.lte('selling_price', params.maxPrice);
    }

    if (params.onSaleOnly) {
        query = query.gt('discount_percentage', 0);
    }

    if (params.search) {
        query = query.ilike('title', `%${params.search}%`);
    }

    // Apply pagination bounds if specified
    if (params.offset !== undefined) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    } else if (params.limit !== undefined) {
        query = query.limit(params.limit);
    }

    // Server-side ordering
    const sortField = params.sortBy || 'title';
    const ascending = (params.sortDir || 'asc') === 'asc';
    query = query.order(sortField, { ascending, nullsFirst: false });
    // Secondary sort by title for stable ordering
    if (sortField !== 'title') {
        query = query.order('title', { ascending: true });
    }

    const { data, error, count } = await query;

    if (error) {
        return { data: [], error: error.message, count: 0 };
    }

    return { data: (data || []).map(normalizeDbGame), error: null, count: count || 0 };
}

/**
 * Get total games count
 */
export async function getTotalGamesCount() {
    const { count, error } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('visible', true);

    if (error) {
        return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
}

/**
 * Get all unique genres (used fallback if needed)
 */
export async function getAllGenres() {
    const { data, error } = await supabase
        .from('games')
        .select('genre')
        .eq('visible', true);

    if (error) {
        return { data: [], error: error.message };
    }

    const genres = new Set<string>();
    data?.forEach((row: any) => {
        if (Array.isArray(row.genre)) {
            row.genre.forEach((g: string) => genres.add(g));
        }
    });

    return { data: Array.from(genres).sort(), error: null };
}

/**
 * Get all unique tags (used fallback if needed)
 */
export async function getAllTags() {
    const { data, error } = await supabase
        .from('games')
        .select('tags')
        .eq('visible', true);

    if (error) {
        return { data: [], error: error.message };
    }

    const tags = new Set<string>();
    data?.forEach((row: any) => {
        if (Array.isArray(row.tags)) {
            row.tags.forEach((t: string) => tags.add(t));
        }
    });

    return { data: Array.from(tags).sort(), error: null };
}

/**
 * Get games assigned to a homepage section by its slug
 */
export async function getGamesBySection(sectionSlug: string) {
    const { data, error } = await supabase
        .from('homepage_sections')
        .select(`
            section_games (
                display_order,
                games (
                    id,
                    title,
                    slug,
                    image_url,
                    selling_price,
                    original_price,
                    discount_percentage,
                    genre,
                    tags,
                    series,
                    description,
                    release_status,
                    visible,
                    steam_app_id
                )
            )
        `)
        .eq('slug', sectionSlug)
        .single();

    if (error) {
        return { data: [], error: error.message };
    }

    const mappings = data?.section_games || [];
    const gamesList = mappings
        .filter((m: any) => m.games && m.games.visible)
        .map((m: any) => ({
            ...normalizeDbGame(m.games),
            display_order: m.display_order,
        }))
        .sort((a: any, b: any) => a.display_order - b.display_order);

    return { data: gamesList, error: null };
}

