"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Options = {
  /** Supabase table names to watch for INSERT / UPDATE / DELETE */
  tables: string[];
  /** When false, only visibility/focus refetch runs (no realtime channel) */
  enabled?: boolean;
  /** Collapse burst of DB events into one reload */
  debounceMs?: number;
};

/**
 * Keeps storefront data in sync with admin edits.
 * - Supabase Realtime on the given tables (when publication is enabled)
 * - Refetch when the tab becomes visible / window gains focus (always-on fallback)
 */
export function useStorefrontSync(
  load: () => void | Promise<void>,
  { tables, enabled = true, debounceMs = 400 }: Options
) {
  const loadRef = useRef(load);
  loadRef.current = load;

  const tablesKey = tables.slice().sort().join(",");

  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (!cancelled) void loadRef.current();
      }, debounceMs);
    };

    const channelName = `storefront-sync:${tablesKey}:${Math.random().toString(36).slice(2, 9)}`;
    let channel = supabase.channel(channelName);

    for (const table of tables) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        schedule
      );
    }

    channel.subscribe();

    const onVisible = () => {
      if (document.visibilityState === "visible") schedule();
    };
    const onFocus = () => schedule();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tablesKey captures tables
  }, [tablesKey, enabled, debounceMs]);
}
