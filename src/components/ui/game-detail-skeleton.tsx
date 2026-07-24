"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function GameDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background text-white pb-12 lg:pb-0">
      {/* Navbar placeholder height */}
      <div className="h-[68px] lg:h-24" />

      <div className="pt-[68px] lg:pt-24 pb-20 lg:pb-0 w-full">
        <div className="mx-auto max-w-[1400px] px-0 lg:px-8">
          {/* Breadcrumbs row */}
          <div className="hidden lg:flex items-center justify-between mb-6 px-4 lg:px-0">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>

          <div className="grid lg:grid-cols-[1.8fr_1fr] gap-0 lg:gap-12">
            {/* === LEFT COLUMN === */}
            <div className="w-full min-w-0 flex flex-col gap-0 lg:gap-8">
              {/* Header */}
              <div className="px-6 pt-8 pb-4 lg:px-0 lg:pt-0 lg:pb-0">
                <Skeleton className="h-5 w-20 mb-3" />
                <Skeleton className="h-10 lg:h-14 w-3/4 mb-3" />
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Gallery */}
              <div className="relative w-full">
                <Skeleton className="w-full aspect-video rounded-xl" />
              </div>

              {/* Mobile compact info card */}
              <div className="lg:hidden px-6 py-10 space-y-8">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                  <Skeleton className="h-6 w-18" />
                  <Skeleton className="h-6 w-22" />
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>

              {/* System Requirements */}
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-none lg:rounded-3xl shadow-2xl mt-8 lg:mt-16 overflow-hidden p-6 lg:p-12">
                <Skeleton className="h-6 w-48 mb-8" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-none lg:rounded-3xl p-6 lg:p-12 shadow-2xl mt-8 lg:mt-16 space-y-6">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>

              {/* Similar Games */}
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-none lg:rounded-3xl p-6 lg:p-12 shadow-2xl mt-8 lg:mt-16 mb-8 lg:mb-16">
                <Skeleton className="h-6 w-36 mb-6" />
                <div className="flex gap-4 overflow-hidden">
                  <Skeleton className="h-[240px] w-[180px] lg:w-[200px] flex-shrink-0 rounded-xl" />
                  <Skeleton className="h-[240px] w-[180px] lg:w-[200px] flex-shrink-0 rounded-xl" />
                  <Skeleton className="h-[240px] w-[180px] lg:w-[200px] flex-shrink-0 rounded-xl" />
                  <Skeleton className="h-[240px] w-[180px] lg:w-[200px] flex-shrink-0 rounded-xl" />
                </div>
              </div>
            </div>

            {/* === RIGHT COLUMN === */}
            <div className="hidden lg:block relative h-full">
              <div className="sticky top-24 w-full space-y-6">
                {/* Poster */}
                <Skeleton className="aspect-[460/215] w-full rounded-lg" />

                {/* Buy Card */}
                <div className="bg-card/60 backdrop-blur-md border border-white/5 p-4 rounded-lg shadow-xl space-y-4">
                  <div className="flex items-end gap-2">
                    <Skeleton className="h-6 w-14" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                {/* Short About */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>

                {/* Meta info */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>

                {/* Tags */}
                <div className="pt-2 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-6 w-14" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-18" />
                    <Skeleton className="h-6 w-14" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-white/10 lg:hidden z-40">
        <div className="px-3 pt-2.5 flex items-center gap-2.5" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
          <div className="flex flex-col gap-1 flex-shrink-0 max-w-[30%]">
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-2.5 w-8" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Skeleton className="h-11 w-11 rounded-xl flex-shrink-0" />
            <Skeleton className="h-11 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
