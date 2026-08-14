import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 lg:mb-6",
        align === "center" && "text-center",
        className
      )}
    >
      <h2 className="section-heading text-2xl lg:text-4xl flex items-center gap-2">
        {icon && <span className="text-white">{icon}</span>}
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm lg:text-base text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
