"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselNavProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  itemCount: number;
  show?: boolean;
  className?: string;
}

export function CarouselNav({
  scrollRef,
  itemCount,
  show = true,
  className = "",
}: CarouselNavProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredArrow, setHoveredArrow] = useState<"left" | "right" | null>(null);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(maxScroll > 5 && el.scrollLeft < maxScroll - 5);
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    const timeout = setTimeout(updateScrollState, 150);

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      clearTimeout(timeout);
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [scrollRef, updateScrollState]);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const el = scrollRef.current;
      if (!el || el.children.length < 2) return;

      const firstChild = el.children[0] as HTMLElement;
      const secondChild = el.children[1] as HTMLElement;
      const gap = secondChild.offsetLeft - (firstChild.offsetLeft + firstChild.offsetWidth);
      const scrollAmount = firstChild.offsetWidth + gap;

      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    },
    [scrollRef]
  );

  if (!show || itemCount <= 1) return null;

  return (
    <div className={`hidden lg:flex items-center gap-1 ${className}`}>
      {/* Left arrow */}
      <div className="relative flex items-center justify-center">
        {hoveredArrow === "left" && canScrollLeft && (
          <div className="absolute -top-[34px] left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-white/[0.08] text-white/70 text-xs font-medium px-3 py-[6px] rounded-lg whitespace-nowrap shadow-lg">
            Prev
          </div>
        )}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          onMouseEnter={() => setHoveredArrow("left")}
          onMouseLeave={() => setHoveredArrow(null)}
          className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer ${
            canScrollLeft
              ? "text-white hover:bg-white/[0.08]"
              : "text-white/[0.12]"
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.2} />
        </button>
      </div>

      {/* Right arrow */}
      <div className="relative flex items-center justify-center">
        {hoveredArrow === "right" && canScrollRight && (
          <div className="absolute -top-[34px] left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-white/[0.08] text-white/70 text-xs font-medium px-3 py-[6px] rounded-lg whitespace-nowrap shadow-lg">
            Next
          </div>
        )}
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          onMouseEnter={() => setHoveredArrow("right")}
          onMouseLeave={() => setHoveredArrow(null)}
          className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer ${
            canScrollRight
              ? "text-white hover:bg-white/[0.08]"
              : "text-white/[0.12]"
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-[18px] h-[18px]" strokeWidth={1.2} />
        </button>
      </div>
    </div>
  );
}
