import React from "react";
import { cn } from "@/lib/utils";
import { ShareButton } from "@/components/ui/share-button";
import { getSectionShareUrl } from "@/lib/share";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  /** When set, renders a share button deep-linking to this homepage section. */
  shareId?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  align = "left",
  className,
  shareId,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 lg:mb-6",
        align === "center" && "text-center",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="section-heading text-2xl lg:text-4xl flex items-center gap-2">
          {icon && <span className="text-white">{icon}</span>}
          {title}
        </h2>
        {shareId && (
          <ShareButton
            url={getSectionShareUrl(shareId)}
            text={`Check out ${title} on Gamer Bhidu!`}
            tooltip="Share this section"
          />
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-sm lg:text-base text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
