"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isHomeSectionId } from "@/lib/share";
import { scrollToSectionIdWithRetry } from "@/lib/scroll-utils";

/**
 * Mounted on the homepage. Handles shareable deep links so a customer who
 * opens a shared link lands directly on the relevant section:
 *   /?section=hot-deals   → scrolls to the Hot Deals section
 *   /#hot-deals           → same, browser hash style
 *   /?combo=<id>          → auto-opens the Value Combos dialog for that combo
 */
export default function DeepLinkHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const section = searchParams.get("section");
    if (section && isHomeSectionId(section)) {
      cleanup = scrollToSectionIdWithRetry(section);
      // Normalise the URL to /#section so it stays clean and shareable.
      const t = setTimeout(() => {
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("section");
          window.history.replaceState({}, "", `${url.pathname}#${section}`);
        }
      }, 1000);
      return () => {
        cleanup?.();
        clearTimeout(t);
      };
    }

    const combo = searchParams.get("combo");
    if (combo) {
      window.__pendingComboId = combo;
      window.dispatchEvent(
        new CustomEvent<string>("gamerbhidu:open-combo", { detail: combo })
      );
      // Keep the ?combo= param so a reload re-opens the same combo.
      return;
    }

    return () => cleanup?.();
  }, [pathname, searchParams]);

  // Browser hash navigation (e.g. clicking /#hot-deals while on the homepage).
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash && isHomeSectionId(hash)) {
        scrollToSectionIdWithRetry(hash);
      }
    };
    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}