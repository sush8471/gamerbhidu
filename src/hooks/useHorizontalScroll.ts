import { useEffect, useRef } from 'react';

/**
 * Hook to enable horizontal scrolling with mouse wheel
 * @param speed - Scroll speed multiplier (default: 1)
 */
export function useHorizontalScroll<T extends HTMLElement>(speed: number = 1) {
    const scrollRef = useRef<T>(null);

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        const handleWheel = (e: WheelEvent) => {
            // Only handle vertical wheel scroll
            if (e.deltaY !== 0) {
                e.preventDefault();
                // Convert vertical scroll to horizontal
                element.scrollLeft += e.deltaY * speed;
            }
        };

        // Add passive: false to allow preventDefault
        element.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            element.removeEventListener('wheel', handleWheel);
        };
    }, [speed]);

    return scrollRef;
}
