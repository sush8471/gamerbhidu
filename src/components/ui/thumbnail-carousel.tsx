"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Default items if none provided
const DEFAULT_ITEMS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=880&h=600&fit=crop', title: 'Mountain Summit' },
];

const FULL_WIDTH_PX = 120;
const COLLAPSED_WIDTH_PX = 35;
const GAP_PX = 2;
const MARGIN_PX = 2;

interface ThumbnailCarouselProps {
  images?: string[]; // Array of image URLs
  className?: string;
}

function Thumbnails({ index, setIndex, items }: { index: number, setIndex: (i: number) => void, items: { id: number, url: string, title: string }[] }) {
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (thumbnailsRef.current) {
      let scrollPosition = 0;
      for (let i = 0; i < index; i++) {
        scrollPosition += COLLAPSED_WIDTH_PX + GAP_PX;
      }

      scrollPosition += MARGIN_PX;

      const containerWidth = thumbnailsRef.current.offsetWidth;
      const centerOffset = containerWidth / 2 - FULL_WIDTH_PX / 2;
      scrollPosition -= centerOffset;

      thumbnailsRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [index]);

  return (
    <div
      ref={thumbnailsRef}
      className='overflow-x-auto py-2'
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className='flex gap-0.5 h-16 sm:h-20' style={{ width: 'fit-content' }}>
        {items.map((item, i) => (
          <motion.button
            key={item.id}
            onClick={() => setIndex(i)}
            initial={false}
            animate={i === index ? 'active' : 'inactive'}
            variants={{
              active: {
                width: FULL_WIDTH_PX,
                marginLeft: MARGIN_PX,
                marginRight: MARGIN_PX,
                opacity: 1
              },
              inactive: {
                width: COLLAPSED_WIDTH_PX,
                marginLeft: 0,
                marginRight: 0,
                opacity: 0.6
              },
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className='relative shrink-0 h-full overflow-hidden rounded-lg border border-white/10'
          >
            <Image
              src={item.url}
              alt={item.title}
              fill
              className='object-cover pointer-events-none select-none'
              draggable={false}
              sizes="120px"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function ThumbnailCarousel({ images, className }: ThumbnailCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Transform string array to object array expected by component
  const items = images?.map((url, i) => ({
    id: i,
    url,
    title: `Image ${i + 1}`
  })) || DEFAULT_ITEMS;

  const x = useMotionValue(0);

  useEffect(() => {
    if (!isDragging && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth || 1;
      const targetX = -index * containerWidth;

      animate(x, targetX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
    }
  }, [index, x, isDragging]);

  // Handle window resize to reset position
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        x.set(-index * containerWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [index, x]);

  return (
    <div className={`w-full ${className}`}>
      <div className='flex flex-col gap-4'>
        {/* Main Carousel */}
        <div className='relative overflow-hidden rounded-xl bg-black/50 aspect-video shadow-2xl border border-white/10 group' ref={containerRef}>
          <motion.div
            className='flex h-full'
            drag='x'
            dragElastic={0.2}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e, info) => {
              setIsDragging(false);
              const containerWidth = containerRef.current?.clientWidth || 1;
              const offset = info.offset.x;
              const velocity = info.velocity.x;

              let newIndex = index;

              // If fast swipe, use velocity
              if (Math.abs(velocity) > 500) {
                newIndex = velocity > 0 ? index - 1 : index + 1;
              }
              // Otherwise use offset threshold (30% of container width)
              else if (Math.abs(offset) > containerWidth * 0.3) {
                newIndex = offset > 0 ? index - 1 : index + 1;
              }

              // Clamp index
              newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
              setIndex(newIndex);
            }}
            style={{ x }}
          >
            {items.map((item) => (
              <div key={item.id} className='shrink-0 w-full h-full relative'>
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className='object-contain lg:object-cover select-none pointer-events-none'
                  draggable={false}
                  priority={index === item.id}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1200px"
                />
                 {/* Cinematic Vignette Overlay */}
                 <div className="absolute inset-0 bg-gradient-to-t from-[#080A10] via-transparent to-transparent opacity-60" />
              </div>
            ))}
          </motion.div>

          {/* Previous Button */}
          <button
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full sm:flex items-center justify-center shadow-lg transition-all z-10 backdrop-blur-md border border-white/10 hidden
              ${
                index === 0
                  ? 'opacity-0 cursor-not-allowed hidden'
                  : 'bg-black/50 text-white hover:bg-[#00D2FF] hover:scale-110 opacity-0 group-hover:opacity-100'
              }`}
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
          </button>

          {/* Next Button */}
          <button
            disabled={index === items.length - 1}
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full sm:flex items-center justify-center shadow-lg transition-all z-10 backdrop-blur-md border border-white/10 hidden
              ${
                index === items.length - 1
                  ? 'opacity-0 cursor-not-allowed hidden'
                  : 'bg-black/50 text-white hover:bg-[#00D2FF] hover:scale-110 opacity-0 group-hover:opacity-100'
              }`}
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>

          {/* Image Counter */}
          <div className='hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white/80 px-3 py-1 rounded-full text-xs backdrop-blur-md border border-white/10 font-mono'>
            {index + 1} / {items.length}
          </div>
        </div>

        {/* Thumbnails (Desktop) / Dots (Mobile) */}
        <div className="hidden sm:block">
          <Thumbnails index={index} setIndex={setIndex} items={items} />
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex sm:hidden justify-center gap-1.5 mt-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-[#00D2FF]" : "w-1.5 bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
