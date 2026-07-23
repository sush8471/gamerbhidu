"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

export default function GamePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: Props) {
  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#262626] px-4 py-3 bg-black/5">
      <p className="text-xs text-muted-foreground text-center sm:text-left">
        Showing{" "}
        <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> –{" "}
        <span className="font-semibold text-white">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{" "}
        of <span className="font-semibold text-white">{totalItems}</span> games
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="p-2.5 border border-[#262626] rounded-lg bg-[#050505]/50 text-muted-foreground hover:text-white hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-muted-foreground min-w-[80px] text-center">
          Page <span className="font-bold text-white">{currentPage}</span> of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="p-2.5 border border-[#262626] rounded-lg bg-[#050505]/50 text-muted-foreground hover:text-white hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
