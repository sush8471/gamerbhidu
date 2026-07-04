/**
 * Steam API Utilities
 * Fetches game data from Steam Store API with caching
 */

// In-memory cache for Steam API responses
const steamCache = new Map<number, { data: SteamGameDetails; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Steam API Types
export interface SteamGameDetails {
  appId: number;
  name: string;
  type: string;
  shortDescription: string;
  headerImage: string;
  website: string | null;
  developers: string[];
  publishers: string[];
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  categories: Array<{ id: number; description: string }>;
  genres: Array<{ id: string; description: string }>;
  screenshots: Array<{
    id: number;
    pathThumbnail: string;
    pathFull: string;
  }>;
  movies: Array<{
    id: number;
    name: string;
    thumbnail: string;
    webm: { 480: string; max: string };
    mp4: { 480: string; max: string };
  }>;
  releaseDate: {
    comingSoon: boolean;
    date: string;
  };
  supportedLanguages: string;
  detailedDescription: string;
  aboutTheGame: string;
  pcRequirements: {
    minimum: string;
    recommended: string;
  };
  metacritic?: {
    score: number;
    url: string;
  };
}

export interface SteamAPIResponse {
  success: boolean;
  data?: SteamGameDetails;
}

/**
 * Fetch game details from Steam Store API via our proxy with caching
 * @param appId - Steam App ID
 * @returns Game details or null if not found
 */
export async function getSteamGameDetails(
  appId: number
): Promise<SteamGameDetails | null> {
  // Check cache first
  const cached = steamCache.get(appId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const isServer = typeof window === 'undefined';
    const url = isServer
      ? `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=in&l=english`
      : `/api/steam?appId=${appId}`;

    const headers: HeadersInit = isServer
      ? { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      : {};

    const response = await fetch(url, {
      headers,
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      console.error(`Steam API proxy error for App ID ${appId}: ${response.status}`);
      return null;
    }

    const json = await response.json();

    if (json.error) {
      console.error(`Steam API proxy returned error for App ID ${appId}:`, json.error);
      return null;
    }

    const result = json[appId.toString()];

    if (!result || !result.success || !result.data) {
      console.error(`Steam API returned no data for App ID ${appId}`);
      return null;
    }

    const steamData = result.data;

    const gameDetails: SteamGameDetails = {
      appId,
      name: steamData.name,
      type: steamData.type,
      shortDescription: steamData.short_description || '',
      headerImage: steamData.header_image || '',
      website: steamData.website || null,
      developers: steamData.developers || [],
      publishers: steamData.publishers || [],
      platforms: steamData.platforms || { windows: false, mac: false, linux: false },
      categories: steamData.categories || [],
      genres: steamData.genres || [],
      screenshots: (steamData.screenshots || []).map((s: any) => ({
        id: s.id,
        pathThumbnail: s.path_thumbnail,
        pathFull: s.path_full
      })),
      movies: steamData.movies || [],
      releaseDate: steamData.release_date || { comingSoon: false, date: '' },
      supportedLanguages: steamData.supported_languages || '',
      detailedDescription: steamData.detailed_description || '',
      aboutTheGame: steamData.about_the_game || '',
      pcRequirements: steamData.pc_requirements || { minimum: '', recommended: '' },
      metacritic: steamData.metacritic
    };

    // Store in cache
    steamCache.set(appId, { data: gameDetails, timestamp: Date.now() });

    return gameDetails;
  } catch (error) {
    console.error(`Error fetching Steam data for App ID ${appId}:`, error);
    return null;
  }
}

/**
 * Get only screenshots from Steam
 */
export async function getSteamScreenshots(appId: number) {
  const data = await getSteamGameDetails(appId);
  return data?.screenshots || [];
}

/**
 * Get only system requirements from Steam
 */
export async function getSteamSystemRequirements(appId: number) {
  const data = await getSteamGameDetails(appId);
  return data?.pcRequirements || null;
}

/**
 * Extract plain text from HTML system requirements
 */
export function parseSystemRequirements(html: string): {
  os?: string;
  processor?: string;
  memory?: string;
  graphics?: string;
  storage?: string;
  additional?: string;
} {
  if (!html) return {};

  const requirements: any = {};

  // Simple regex extraction (Steam uses consistent format)
  const patterns = {
    os: /<strong>OS[^:]*:<\/strong>\s*([^<]+)/i,
    processor: /<strong>Processor[^:]*:<\/strong>\s*([^<]+)/i,
    memory: /<strong>Memory[^:]*:<\/strong>\s*([^<]+)/i,
    graphics: /<strong>Graphics[^:]*:<\/strong>\s*([^<]+)/i,
    storage: /<strong>(?:Storage|Hard Drive)[^:]*:<\/strong>\s*([^<]+)/i,
    additional: /<strong>Additional[^:]*:<\/strong>\s*([^<]+)/i,
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = html.match(pattern);
    if (match) {
      requirements[key] = match[1].trim();
    }
  }

  return requirements;
}

/**
 * Clean HTML description to plain text
 */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}
