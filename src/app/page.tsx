"use client";

import { lazy, Suspense } from "react";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import HowItWorks from "@/components/sections/how-it-works";
import GameCardsGridDiscover from "@/components/sections/game-cards-grid-discover";
import SocialProof from "@/components/sections/social-proof";
import SteamRushNavbar from "@/components/sections/steamrush-navbar";
import { Typewriter } from "@/components/ui/typewriter-text";

// Lazy load non-critical sections for better initial load performance
const ComboDealSection = lazy(() => import("@/components/sections/combo-deals"));
const RecentlyLaunched = lazy(() => import("@/components/sections/recently-launched"));
const UpcomingGames = lazy(() => import("@/components/sections/upcoming-games"));
const FAQ = lazy(() => import("@/components/sections/faq"));
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
    <main className="min-h-screen bg-[#080A10]">
      <SteamRushNavbar />
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

      <HowItWorks />
      <div id="hot-deals">
        <GameCardsGridDiscover />
      </div>
      <Suspense fallback={<div className="h-96 bg-[#080A10]" />}>
        <ComboDealSection />
      </Suspense>
      <SocialProof />

      <Suspense fallback={<div className="h-96 bg-[#080A10]" />}>
        <RecentlyLaunched />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-[#080A10]" />}>
        <UpcomingGames />
      </Suspense>
      <div id="faq">
        <Suspense fallback={<div className="h-64 bg-[#080A10]" />}>
          <FAQ />
        </Suspense>
      </div>
      <Suspense fallback={<div className="h-32 bg-[#080A10]" />}>
        <Footer />
      </Suspense>
    </main>
  );
}
