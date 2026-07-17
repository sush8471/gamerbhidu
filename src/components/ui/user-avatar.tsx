"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  /** Size in pixels — renders as a square. Default: 32 */
  size?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns up-to-2 uppercase initials from a full name string */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Circular avatar that shows:
 *   1. Google profile picture (if avatarUrl is set)
 *   2. Initials fallback (if name is provided)
 *   3. Generic "?" fallback (last resort)
 */
export function UserAvatar({
  name,
  avatarUrl,
  size = 32,
  className,
}: UserAvatarProps) {
  const initials = name ? getInitials(name) : "?";

  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full select-none",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* 1. Try to load the actual Google avatar image */}
      {avatarUrl && (
        <AvatarPrimitive.Image
          src={avatarUrl}
          alt={name ?? "User avatar"}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      )}

      {/* 2. Fallback: coloured circle with initials */}
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 border border-primary/30 text-primary font-semibold"
        style={{ fontSize: Math.max(size * 0.38, 10) }}
        delayMs={avatarUrl ? 300 : 0}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
