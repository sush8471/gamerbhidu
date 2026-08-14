"use client";

import { useRef, useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { shareOrCopy } from "@/lib/share";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  size?: "sm" | "md";
  className?: string;
  tooltip?: string;
}

/**
 * Share button that uses the native share sheet when available and falls
 * back to copying the link to the clipboard with a toast notification.
 */
export function ShareButton({
  url,
  title,
  text,
  size = "sm",
  className,
  tooltip,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = async () => {
    const result = await shareOrCopy({ url, title, text });
    if (result === "copied") {
      setCopied(true);
      toast.success("Link copied to clipboard");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses =
    size === "md"
      ? "h-9 w-9 rounded-lg"
      : "h-7 w-7 rounded-md";

  const button = (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? "Link copied" : "Share link"}
      title={copied ? "Link copied" : tooltip ?? "Share link"}
      className={cn(
        "inline-flex items-center justify-center text-muted-foreground hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-all duration-200 active:scale-95",
        sizeClasses,
        className
      )}
    >
      {copied ? (
        <Check className={size === "md" ? "h-4 w-4 text-emerald-400" : "h-3.5 w-3.5 text-emerald-400"} />
      ) : (
        <Share2 className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      )}
    </button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{copied ? "Link copied" : (tooltip ?? "Share link")}</TooltipContent>
    </Tooltip>
  );
}