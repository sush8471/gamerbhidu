"use client";

import { useState, useEffect } from "react";
import { parseDateTimeUtc } from "@/lib/dates";

export function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      setExpired(false);
      return;
    }

    const target = parseDateTimeUtc(expiresAt);
    if (Number.isNaN(target)) {
      setRemaining(null);
      setExpired(false);
      return;
    }

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setRemaining(null);
        return;
      }
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return { remaining, expired };
}
