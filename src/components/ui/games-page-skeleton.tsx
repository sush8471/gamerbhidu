"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border-0">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <div className="p-2.5 space-y-2 mt-1">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <Skeleton className="h-8 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}

export default function GamesPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
      {/* Navbar placeholder */}
      <div className="h-[68px] lg:h-24" />

      <div className="pt-6 pb-16">
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="w-5 h-5 sm:w-7 sm:h-7 rounded" />
                <Skeleton className="h-7 sm:h-9 lg:h-10 w-32 rounded" />
              </div>
              <Skeleton className="h-4 w-64 hidden sm:block mt-2 rounded" />
            </div>
          </div>

          {/* Top Control Bar */}
          <div className="hidden sm:flex flex-wrap items-center gap-3 mb-3 bg-card border border-border rounded-xl px-4 py-3">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-4 w-32 flex-1 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-10 rounded hidden md:block" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>

          {/* Filter Panel */}
          <div className="hidden sm:block mb-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Genre column */}
                <div className="space-y-3">
                  <Skeleton className="h-3 w-14 rounded" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={`g-${i}`} className="flex items-center gap-2">
                        <Skeleton className="w-3.5 h-3.5 rounded flex-shrink-0" />
                        <Skeleton className="h-3 w-20 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Price column */}
                <div className="space-y-3">
                  <Skeleton className="h-3 w-24 rounded" />
                  <div className="space-y-2.5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={`p-${i}`} className="flex items-center gap-2.5">
                        <Skeleton className="w-3.5 h-3.5 rounded-full flex-shrink-0" />
                        <Skeleton className="h-3 w-24 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Special Offers column */}
                <div className="space-y-3">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
