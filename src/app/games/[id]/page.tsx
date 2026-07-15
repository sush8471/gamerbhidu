"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, MessageCircle, Check, Monitor, Share2, ChevronLeft, ChevronRight, HelpCircle, Gamepad2, ShieldCheck, Zap, Clock, ThumbsUp, ShoppingCart, ChevronUp } from "lucide-react";
import GamerBhiduNavbar from "@/components/sections/gamerbhidu-navbar";
import Footer from "@/components/sections/footer";
import { getSteamGameDetails, parseSystemRequirements, type SteamGameDetails } from "@/lib/steam-api";
import { getGameBySlug, getGames, type Game } from "@/lib/local-db";
import { useCart } from "@/context/CartContext";
import { motion, Variants } from "framer-motion";
import ThumbnailCarousel from "@/components/ui/thumbnail-carousel";
import { SectionHeader } from "@/components/ui/section-header";

// Skeleton Component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`} />
);

// FAQ Item Component
const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => (
  <div className="border-b border-white/5 last:border-0">
    <button
      onClick={onClick}
      className="w-full py-5 flex items-center justify-between text-left group"
    >
      <span className="text-white font-bold text-sm pr-4 tracking-tight leading-snug">{question}</span>
      <div className={`p-1 rounded-full transition-colors ${isOpen ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
        <ChevronDown className={`w-3.5 h-3.5 text-white/60 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
    </button>
    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[400px] pb-6' : 'max-h-0'}`}>
      <p className="text-muted-foreground text-sm leading-relaxed font-light">{answer}</p>
    </div>
  </div>
);

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function GameDetailPage() {
  const params = useParams();
  const slug = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [steamData, setSteamData] = useState<SteamGameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarGames, setSimilarGames] = useState<Game[]>([]);

  const [showStickyNav, setShowStickyNav] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showAdditional, setShowAdditional] = useState(false);
  const [showSystemReqs, setShowSystemReqs] = useState(true);

  const { addToCart, isInCart } = useCart();
  const isAdded = game ? isInCart(game.slug) : false;

  const handleAddToCart = () => {
    if (game) {
      addToCart({
        id: game.slug,
        name: game.title,
        price: Number(game.price),
        image: game.image_url,
        originalPrice: game.original_price ? Number(game.original_price) : undefined
      });
    }
  };

  // Fetch game from local database
  useEffect(() => {
    async function fetchGame() {
      console.log('🔍 Fetching game with slug:', slug);
      const { data, error } = await getGameBySlug(slug);
      console.log('📦 Game fetch result:', { data, error });

      if (data) {
        console.log('✅ Game found:', data.title);
        setGame(data);

        // Fetch similar games based on genre and tags
        const { data: allGames } = await getGames({
          genre: data.genre,
          limit: 100
        });

        if (allGames) {
          // Calculate similarity score
          const scored = allGames
            .filter(g => g.id !== data.id)
            .map(g => {
              let score = 0;
              if (data.series && g.series === data.series) score += 10;
              const matchingTags = g.tags.filter(t => data.tags.includes(t)).length;
              score += matchingTags * 2;
              const commonGenres = g.genre.filter(gen => data.genre.includes(gen)).length;
              score += commonGenres;
              return { game: g, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)
            .map(item => item.game);

          setSimilarGames(scored);
        }
      } else {
        console.error('❌ Game not found or error:', error);
      }
      setLoading(false);
    }
    fetchGame();

    const handleScroll = () => {
      setShowStickyNav(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);

  // Fetch Steam data when game is loaded
  useEffect(() => {
    if (!game?.steam_app_id) return;

    async function fetchSteamData() {
      try {
        const data = await getSteamGameDetails(game.steam_app_id!);
        setSteamData(data);
      } catch (error) {
        console.error("Error fetching Steam data:", error);
      }
    }
    fetchSteamData();
  }, [game?.steam_app_id]);

  // Show loading state while fetching
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white/40 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game details...</p>
        </div>
      </main>
    );
  }

  // Show "not found" only after loading completes and game is still null
  if (!loading && !game) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
          <Link href="/games" className="text-white hover:underline">Back to Store</Link>
        </div>
      </main>
    );
  }


  // Data Processing
  const minRequirements = steamData?.pcRequirements?.minimum ? parseSystemRequirements(steamData.pcRequirements.minimum) : null;
  const recRequirements = steamData?.pcRequirements?.recommended ? parseSystemRequirements(steamData.pcRequirements.recommended) : null;
  const screenshots = steamData?.screenshots?.map(s => s.pathFull).filter(Boolean).slice(0, 15) || [];
  const headerImage = game ? (steamData?.headerImage || game.image_url) : "";
  const allGalleryImages = screenshots.length > 0 ? screenshots : [headerImage];
  const description = steamData?.shortDescription || game?.description || "";
  const discount = game?.discount_percentage ? `-${game.discount_percentage}%` : null;

  // FAQ data
  const faqData = [
    {
      question: "How does the activation process work?",
      answer: "After payment, we provide a complete package including specialized files, resources, and a step-by-step tutorial. By following our guide and installing these files into your Steam application, the game will be permanently activated in your personal Steam library."
    },
    {
      question: "Are these Steam games files or a shared account?",
      answer: "Neither! We use a unique 'Personal Activation' method. This allows you to have the game in your own personal Steam library. You won't need to manage shared accounts or worry about steam games files; you'll have full access to download and play directly from Steam."
    },
    {
      question: "How fast will I receive the resources?",
      answer: "Instantly! Once your payment is confirmed on WhatsApp, we'll send you the download link for the activation files and the tutorial immediately. Most customers complete the entire setup in under 5 minutes."
    },
    {
      question: "Can I download and update via Steam?",
      answer: "Absolutely. Once you follow our tutorial to activate the game, it becomes part of your Steam library. You can then use Steam's official servers to download the game, receive updates, and launch it just like any other game."
    },
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: game.title,
          text: `Check out ${game.title} on Gamer Bhidu!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Optional: Add toast notification here
    }
  };

  return (
    <main className="min-h-screen bg-background text-white selection:bg-white/30 selection:text-white pb-12 lg:pb-0">
      <GamerBhiduNavbar />

      {/* IMMERSIVE BACKGROUND */}
      <div className="fixed inset-0 h-screen -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a09]/20 via-[#0c0a09]/80 to-[#0c0a09] z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a09]/50 via-transparent to-[#0c0a09]/50 z-10" />
        <Image
          src={headerImage}
          alt=""
          fill
          className="object-cover opacity-40 blur-[80px] scale-125 saturate-150 animate-pulse-slow"
          priority
        />
      </div>

      <div className="pt-[68px] lg:pt-24 pb-20 lg:pb-0 w-full">
        <div className="mx-auto max-w-[1400px] px-0 lg:px-8">

          {/* Breadcrumbs - Desktop */}
          <div className="hidden lg:flex items-center justify-between mb-6 px-4 lg:px-0">
            <Link href="/games" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors group">
              <div className="p-1 rounded-full bg-white/5 group-hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-4 h-4 text-white" />
              </div>
              <span>Back to Store</span>
            </Link>
            <button onClick={handleShare} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid lg:grid-cols-[1.8fr_1fr] gap-0 lg:gap-12">

            {/* === LEFT COLUMN === */}
            <div className="w-full min-w-0 flex flex-col gap-0 lg:gap-8">

              {/* HEADER (Title & Reviews Above Gallery) */}
              <div className="px-6 pt-8 pb-4 lg:px-0 lg:pt-0 lg:pb-0 lg:bg-transparent bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                    Base Game
                  </span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-white leading-none mb-3 tracking-tight">{game.title}</h1>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-md border border-white/10">
                    <ThumbsUp className="w-3.5 h-3.5 text-white fill-white" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">Overwhelmingly Positive</span>
                  </div>
                  <span className="text-muted-foreground text-xs font-medium tracking-tight">(2.4M+ Reviews)</span>
                </div>
              </div>

              {/* SWIPEABLE GALLERY */}
              <div className="relative w-full group">
                {/* Cinematic Glow (Desktop) */}
                <div className="hidden lg:block absolute -inset-10 bg-gradient-to-r from-white/5 to-white/5 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {loading ? (
                  <Skeleton className="w-full aspect-video rounded-xl" />
                ) : (
                  <ThumbnailCarousel images={allGalleryImages} />
                )}
              </div>

              {/* MOBILE: COMPACT INFO CARD (Rest of Content Below Gallery) */}
              <div className="lg:hidden px-6 py-10 bg-gradient-to-b from-[#0c0a09] to-transparent">

                {/* Short About & Metadata */}
                <div className="space-y-8">
                  <p className="text-muted-foreground text-sm leading-relaxed font-light opacity-90">
                    {steamData?.shortDescription || description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {[...game.genre, ...(game.tags || [])].slice(0, 5).map(tag => (
                      <span key={tag} className="px-3 py-1 bg-card border border-white/10 text-white text-xs rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-muted-foreground text-[10px] uppercase font-black tracking-[0.15em] opacity-60">Developer</span>
                      <span className="text-white text-sm font-bold tracking-tight">{steamData?.developers?.[0] || "Unknown"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-muted-foreground text-[10px] uppercase font-black tracking-[0.15em] opacity-60">Publisher</span>
                      <span className="text-white text-sm font-bold tracking-tight">{steamData?.publishers?.[0] || "Unknown"}</span>
                    </div>
                  </div>
                </div>
              </div>



              {/* SYSTEM REQUIREMENTS - Collapsible */}
              {(minRequirements || recRequirements) && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUp}
                  className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-none lg:rounded-3xl shadow-2xl mt-8 lg:mt-16 overflow-hidden"
                >
                  {/* Clickable Header */}
                  <button
                    onClick={() => setShowSystemReqs(!showSystemReqs)}
                    className="w-full flex items-center justify-between p-6 lg:p-12 pb-0 lg:pb-0 group"
                  >
                    <SectionHeader
                      title="System Requirements"
                      icon={<Monitor className="w-5 h-5" />}
                      className="mb-5"
                    />
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                      <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${showSystemReqs ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Collapsible Content */}
                  <div className={`transition-all duration-500 ease-in-out ${showSystemReqs ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 lg:p-12 pt-0 lg:pt-0">
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <>
                      {/* Mobile: Refined Toggle View */}
                      <div className="lg:hidden">
                        <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 mb-8">
                          <button
                            onClick={() => setShowRecommended(false)}
                            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all duration-300 ${!showRecommended ? 'bg-white/15 text-white border border-white/20' : 'text-muted-foreground hover:text-white'}`}
                          >
                            Minimum
                          </button>
                          <button
                            onClick={() => setShowRecommended(true)}
                            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all duration-300 ${showRecommended ? 'bg-white/15 text-white border border-white/20' : 'text-muted-foreground hover:text-white'}`}
                          >
                            Recommended
                          </button>
                        </div>

                        <div className="space-y-6">
                          {Object.entries((showRecommended ? recRequirements : minRequirements) || {}).filter(([key]) => key.toLowerCase() !== 'additional').map(([key, val]) => (
                            <div key={key} className="flex flex-col border-b border-white/5 pb-4 last:border-0 last:pb-0">
                              <span className="text-muted-foreground text-[9px] uppercase tracking-[0.2em] font-black mb-2 opacity-60">{key}</span>
                              <span className="text-white/90 font-medium text-sm leading-relaxed">{val as string}</span>
                            </div>
                          ))}
                        </div>

                        {/* Additional Notes - Collapsible */}
                        {((showRecommended ? recRequirements : minRequirements) as Record<string, string>)?.additional && (
                          <div className="mt-4 border-t border-white/10 pt-3">
                            <button
                              onClick={() => setShowAdditional(!showAdditional)}
                              className="w-full flex items-center justify-between py-2 text-muted-foreground hover:text-white transition-colors"
                            >
                              <span className="text-xs font-medium uppercase tracking-wide">Additional Notes</span>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAdditional ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${showAdditional ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                              <p className="text-muted-foreground text-xs leading-relaxed pt-2">
                                {((showRecommended ? recRequirements : minRequirements) as Record<string, string>)?.additional}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Desktop: Side by Side */}
                      <div className="hidden lg:block">
                        <div className="grid grid-cols-2 gap-12 divide-x divide-white/5">
                          <div className="space-y-6">
                            <div className="text-white text-[11px] font-black uppercase tracking-[0.2em] bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">Minimum</div>
                            <div className="space-y-3 text-sm">
                              {Object.entries(minRequirements || {}).filter(([key]) => key.toLowerCase() !== 'additional').map(([key, val]) => (
                                <div key={key}>
                                  <span className="text-muted-foreground text-[10px] uppercase font-black tracking-[0.1em] block mb-2 opacity-50">{key}</span>
                                  <span className="text-white/90 font-medium leading-relaxed">{val as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-6 pl-12">
                            <div className="text-white text-[11px] font-black uppercase tracking-[0.2em] bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">Recommended</div>
                            <div className="space-y-5 text-sm">
                              {Object.entries(recRequirements || {}).filter(([key]) => key.toLowerCase() !== 'additional').map(([key, val]) => (
                                <div key={key}>
                                  <span className="text-muted-foreground text-[10px] uppercase font-black tracking-[0.1em] block mb-2 opacity-50">{key}</span>
                                  <span className="text-white/90 font-medium leading-relaxed">{val as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Additional Notes - Desktop */}
                        {((minRequirements as Record<string, string>)?.additional || (recRequirements as Record<string, string>)?.additional) && (
                          <div className="mt-6 border-t border-white/10 pt-2 -mx-8 -mb-8">
                            <button
                              onClick={() => setShowAdditional(!showAdditional)}
                              className="w-full flex items-center justify-between px-8 py-4 hover:bg-white/5 transition-all text-muted-foreground hover:text-white"
                            >
                              <span className="text-xs font-bold uppercase tracking-wide">Additional Notes</span>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAdditional ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 bg-black/20 ${showAdditional ? 'max-h-[500px] opacity-100 px-8 py-4 pb-8' : 'max-h-0 opacity-0 px-8 py-0'}`}>
                              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl font-light">
                                {(minRequirements as Record<string, string>)?.additional || (recRequirements as Record<string, string>)?.additional}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* FAQ SECTION */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-none lg:rounded-3xl p-6 lg:p-12 shadow-2xl mt-8 lg:mt-16"
              >
                <SectionHeader
                  title="Frequently Asked"
                  icon={<HelpCircle className="w-5 h-5" />}
                  className="mb-5"
                />

                <div className="space-y-2">
                  {faqData.map((faq, idx) => (
                    <FAQItem
                      key={idx}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openFAQ === idx}
                      onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                    />
                  ))}
                </div>
              </motion.div>

              {/* SIMILAR GAMES */}
              {similarGames.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUp}
                  className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-none lg:rounded-3xl p-6 lg:p-12 shadow-2xl mt-8 lg:mt-16"
                >
                  <SectionHeader
                    title="You May Also Like"
                    icon={<Gamepad2 className="w-5 h-5" />}
                    className="mb-4"
                  />

                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1 snap-x snap-mandatory">
                    {similarGames.map((sg) => (
                      <Link
                        key={sg.id}
                        href={`/games/${sg.slug}`}
                        className="relative flex-shrink-0 w-[180px] lg:w-[200px] group snap-start"
                      >
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 ring-1 ring-white/10 group-hover:ring-2 group-hover:ring-white/30 transition-all duration-300">
                          <Image src={sg.image_url} alt={sg.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                          {sg.discount_percentage && (
                            <div className="absolute top-3 left-3 bg-white/15 text-white text-xs font-bold px-2 py-1 rounded shadow-lg backdrop-blur-md">
                              -{sg.discount_percentage}%
                            </div>
                          )}
                        </div>
                        <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-white transition-colors mb-1">{sg.title}</h3>
                        <div className="flex items-center gap-2">
                          {sg.original_price && <span className="text-muted-foreground text-xs line-through">₹{sg.original_price}</span>}
                          <span className="text-white text-sm font-bold">₹{sg.price}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* === RIGHT COLUMN: REBUILT === */}
            <div className="hidden lg:block relative h-full">
              <div className="sticky top-24 w-full space-y-6">

                {/* 1. Game Poster & Info Card */}
                <div className="bg-transparent space-y-4">
                  {/* Poster */}
                  <div className="relative aspect-[460/215] w-full rounded-lg overflow-hidden border border-white/10 shadow-lg">
                    <Image
                      src={headerImage}
                      alt={game.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* 2. Buy Buttons & Price (Moved Up) */}
                  <div className="bg-card/60 backdrop-blur-md border border-white/5 p-4 rounded-lg shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Image src={game.image_url} width={100} height={100} alt="" className="rounded-full blur-xl" />
                    </div>

                    <div className="relative z-10 space-y-4">
                      <div className="flex items-end gap-2 mb-1">
                        <div className="bg-white/15 px-2 py-0.5 rounded-sm">
                          <span className="text-white text-sm font-bold">{discount}</span>
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-muted-foreground text-[11px] line-through decoration-[1px]">₹{game.original_price}</span>
                          <span className="text-white text-lg font-bold">₹{game.price}</span>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <button
                          onClick={() => window.open(`https://wa.me/917752805529?text=I want to buy ${game.title}`, '_blank')}
                          className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2.5 rounded-sm flex items-center justify-center gap-2 transition-all border border-white/20"
                        >
                          <MessageCircle className="w-4 h-4 fill-white/20" />
                          Buy Now
                        </button>

                        <button
                          onClick={handleAddToCart}
                          disabled={isAdded}
                          className={`w-full text-white text-sm font-medium py-2.5 rounded-sm flex items-center justify-center gap-2 transition-all border ${isAdded ? 'bg-card border-white/10 cursor-default opacity-70' : 'bg-card hover:bg-card border-white/10'}`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-4 h-4 text-white" />
                              In Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 text-white" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Short About */}
                  <p className="text-muted-foreground text-sm leading-6 line-clamp-4 font-light">
                    {steamData?.shortDescription || description}
                  </p>

                  {/* Release Date & Meta */}
                  <div className="space-y-2 pt-2">
                    <div className="flex text-sm">
                      <span className="w-28 text-muted-foreground uppercase font-bold tracking-wide text-[10px] pt-0.5">Release Date</span>
                      <span className="text-muted-foreground">{steamData?.releaseDate?.date || "Coming Soon"}</span>
                    </div>
                    <div className="flex text-sm">
                      <span className="w-28 text-muted-foreground uppercase font-bold tracking-wide text-[10px] pt-0.5">Developer</span>
                      <span className="text-white hover:text-white transition-colors cursor-pointer">{steamData?.developers?.[0] || "Unknown"}</span>
                    </div>
                    <div className="flex text-sm">
                      <span className="w-28 text-muted-foreground uppercase font-bold tracking-wide text-[10px] pt-0.5">Publisher</span>
                      <span className="text-white hover:text-white transition-colors cursor-pointer">{steamData?.publishers?.[0] || "Unknown"}</span>
                    </div>
                  </div>

                  {/* Popular Tags */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-2">Popular User Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[...game.genre, ...(game.tags || [])].slice(0, 8).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-card border border-white/10 hover:bg-white/20 hover:border-white/20 text-white text-xs rounded transition-all cursor-pointer">
                          {tag}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 text-muted-foreground hover:text-muted-foreground text-base cursor-pointer">+</span>
                    </div>
                  </div>
                </div>



              </div>
            </div>



          </div>
        </div>
      </div>

      {/* MOBILE STICKY BUY BAR - Modern Glassmorphism */}
      <div className={`fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-white/10 lg:hidden transform transition-all duration-300 z-40 pb-safe ${showStickyNav ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        {/* Safe area padding for iPhones without home button */}
        <div className="px-4 py-3 pb-6 flex items-center justify-between gap-4">

          {/* Price Section */}
          <div className="flex flex-col flex-shrink-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-white/15 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-inner">{discount}</span>
              <span className="text-muted-foreground text-[10px] line-through decoration-white/20">₹{game.original_price}</span>
            </div>
            <span className="text-white text-xl font-black tracking-tight leading-none">₹{game.price}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`h-10 w-10 sm:w-auto sm:px-4 border text-white rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 flex-shrink-0 ${isAdded ? 'bg-card border-white/10 opacity-70' : 'bg-card hover:bg-card border-white/10'}`}
              aria-label={isAdded ? "Already in Cart" : "Add to Cart"}
            >
              {isAdded ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <ShoppingCart className="w-5 h-5 text-white" />
              )}
              <span className="hidden sm:inline text-xs font-bold">{isAdded ? "Added" : "Cart"}</span>
            </button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(`https://wa.me/917752805529?text=I want to buy ${game.title}`, '_blank')}
              className="flex-1 h-10 bg-white/15 hover:bg-white/25 text-white px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-white/20 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              Buy Now
            </motion.button>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
