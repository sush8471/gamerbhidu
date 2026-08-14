/**
 * Shareability helpers for Gamer Bhidu.
 * Central registry of deep-linkable homepage sections + URL builders.
 */

export interface HomeSection {
  id: string;
  title: string;
}

export const HOMEPAGE_SECTIONS: HomeSection[] = [
  { id: "how-it-works", title: "How It Works" },
  { id: "hot-deals", title: "Hot Deals" },
  { id: "social-proof", title: "Social Proof" },
  { id: "value-combos", title: "Value Combos" },
  { id: "steam-recommendations", title: "Steam Recommendations" },
  { id: "recently-launched", title: "Recently Launched" },
  { id: "upcoming-games", title: "Upcoming Games" },
];

export const HOMEPAGE_SECTION_IDS = new Set(
  HOMEPAGE_SECTIONS.map((s) => s.id)
);

export function isHomeSectionId(id: string): boolean {
  return HOMEPAGE_SECTION_IDS.has(id);
}

function baseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://gamerbhidu.vercel.app";
}

/** Shareable deep link to a homepage section, e.g. /?section=hot-deals */
export function getSectionShareUrl(sectionId: string): string {
  return `${baseUrl()}/?section=${encodeURIComponent(sectionId)}`;
}

/** Shareable deep link that auto-opens a combo, e.g. /?combo=<id> */
export function getComboShareUrl(comboId: string): string {
  return `${baseUrl()}/?combo=${encodeURIComponent(comboId)}`;
}

/** Shareable link to a game detail page */
export function getGameShareUrl(slug: string): string {
  return `${baseUrl()}/games/${encodeURIComponent(slug)}`;
}

export type ShareResult = "shared" | "copied" | "cancelled" | "unsupported";

/**
 * Uses the native Web Share API when available, otherwise copies the URL
 * to the clipboard (with a legacy fallback for insecure contexts).
 */
export async function shareOrCopy(options: {
  url: string;
  title?: string;
  text?: string;
}): Promise<ShareResult> {
  const { url, title, text } = options;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch {
      return "cancelled";
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return "copied";
    } catch {
      return "unsupported";
    }
  }
}

declare global {
  interface Window {
    /** Combo id waiting to be opened once the Value Combos section loads. */
    __pendingComboId?: string;
  }
}