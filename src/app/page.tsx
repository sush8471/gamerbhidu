"use client";

import { lazy, Suspense } from "react";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import HowItWorks from "@/components/sections/how-it-works";
import GameCardsGridDiscover from "@/components/sections/game-cards-grid-discover";
import SocialProof from "@/components/sections/social-proof";
import GamerBhiduNavbar from "@/components/sections/gamerbhidu-navbar";
import { Typewriter } from "@/components/ui/typewriter-text";
import ComboDealSkeleton from "@/components/ui/combo-deal-skeleton";
import GameCardRowSkeleton from "@/components/ui/game-card-row-skeleton";
import DeepLinkHandler from "@/components/deep-link-handler";

// Lazy load non-critical sections for better initial load performance
const ComboDealSection = lazy(() => import("@/components/sections/combo-deals"));
const SteamRecommendations = lazy(() => import("@/components/sections/steam-recommendations"));
const RecentlyLaunched = lazy(() => import("@/components/sections/recently-launched"));
const UpcomingGames = lazy(() => import("@/components/sections/upcoming-games"));
const Footer = lazy(() => import("@/components/sections/footer"));

const GAME_POSTERS = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765891250718.png?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/project-w-1vp1b-1765891281211.jpg?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765891321984.png?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765891423972.png?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765891429645.png?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765891467635.png?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765891624761.png?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765891720876.png?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765891811347.png?width=8000&height=8000&resize=contain",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <DeepLinkHandler />
      </Suspense>
      <GamerBhiduNavbar />
      <AnimatedMarqueeHero
        tagline={
          <Typewriter
            text={[
              "India's Largest Offline Activation Steam Store",
              "Most Affordable Gaming Destination",
              "Instant Game Delivery"
            ]}
            speed={80}
            deleteSpeed={50}
            delay={2000}
            loop={true}
          />
        }
        title={
          <>
            Get Your Favorite
            <br />
            PC Games Today
          </>
        }
        description="Original Steam games delivered instantly. Easy payment, fast delivery, trusted by hundreds."
        ctaText="Browse Games"
        images={GAME_POSTERS}
      />

      <div id="how-it-works" className="scroll-mt-20">
        <HowItWorks />
      </div>
      <div id="hot-deals" className="scroll-mt-20">
        <GameCardsGridDiscover />
      </div>

      <div id="social-proof" className="scroll-mt-20">
        <SocialProof />
      </div>

      <div id="value-combos" className="scroll-mt-20">
        <Suspense fallback={<ComboDealSkeleton />}>
          <ComboDealSection />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <div id="steam-recommendations" className="scroll-mt-20">
          <SteamRecommendations />
        </div>
      </Suspense>

      <div id="recently-launched" className="scroll-mt-20">
        <Suspense fallback={
          <GameCardRowSkeleton title="Recently Launched" subtitle="Fresh arrivals - Get them now!" count={6} />
        }>
          <RecentlyLaunched />
        </Suspense>
      </div>
      <div id="upcoming-games" className="scroll-mt-20">
        <Suspense fallback={
          <GameCardRowSkeleton title="Upcoming Games" subtitle="New releases arriving soon" count={6} />
        }>
          <UpcomingGames />
        </Suspense>
      </div>
      <Suspense fallback={<div className="h-32 bg-background" />}>
        <Footer />
      </Suspense>
    </main>
  );
}

