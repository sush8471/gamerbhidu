"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { ReactNode } from "react";

export type MobileAction = {
  label: string;
  icon?: ReactNode;
  variant?: "default" | "destructive" | "warning" | "muted";
  onClick: () => void;
  disabled?: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  actions: MobileAction[];
};

const variantClasses: Record<NonNullable<Props["actions"][number]["variant"]>, string> = {
  default: "text-foreground hover:bg-white/5 border-border",
  destructive: "text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20",
  warning: "text-amber-400 hover:bg-amber-500/10 border-amber-500/20",
  muted: "text-muted-foreground hover:text-white hover:bg-white/5 border-border",
};

export default function MobileActionSheet({
  open,
  onOpenChange,
  title,
  description,
  actions,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-card border-t border-border rounded-t-2xl shadow-2xl p-0 md:hidden"
      >
        <SheetHeader className="px-5 py-4 border-b border-border text-left">
          <SheetTitle className="text-foreground text-sm font-bold truncate">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-[10px] text-muted-foreground font-mono">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="pb-2 pt-1.5 divide-y divide-border">
          {actions.map((action, i) => {
            const variant = action.variant ?? "default";
            const isLast = i === actions.length - 1;
            return (
              <button
                key={i}
                type="button"
                disabled={action.disabled}
                onClick={() => {
                  onOpenChange(false);
                  action.onClick();
                }}
                className={`flex items-center gap-3 w-full px-5 py-3.5 text-left text-sm font-medium transition-all border-l-2 ${
                  action.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                } ${variantClasses[variant]} ${isLast ? "border-l-transparent" : "border-l-transparent"}`}
              >
                {action.icon ? (
                  <span className={`flex-shrink-0 w-4 h-4 flex items-center justify-center ${action.disabled ? "opacity-60" : ""}`}>{action.icon}</span>
                ) : null}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        <div className="h-2" />
      </SheetContent>
    </Sheet>
  );
}
