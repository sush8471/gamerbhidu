"use client";

import React from "react";
import { Check } from "lucide-react";

interface SteamOwnedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function SteamOwnedBadge({
  className = "",
  size = "md",
  showIcon = true,
}: SteamOwnedBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2 font-semibold",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md bg-sky-950/80 border border-sky-500/40 text-sky-300 font-medium backdrop-blur-md shadow-sm ${sizeClasses} ${className}`}
    >
      {showIcon && (
        <svg
          className="w-3.5 h-3.5 fill-sky-400 flex-shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.03 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c-.002.05-.008.098-.008.148 0 1.802 1.464 3.266 3.266 3.266 1.802 0 3.266-1.464 3.266-3.266 0-1.801-1.464-3.265-3.266-3.265-.175 0-.346.015-.513.041l-2.766-3.99c.002-.029.006-.057.006-.086 0-1.636-1.332-2.968-2.968-2.968s-2.968 1.332-2.968 2.968c0 .285.044.558.12.818L3.35 12.355C4.664 5.228 10.923.001 18.423.001A11.976 11.976 0 0111.979 0z" />
        </svg>
      )}
      <span className="flex items-center gap-1">
        <Check className="w-3 h-3 text-sky-400" /> In Steam Library
      </span>
    </span>
  );
}
