'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { Movie } from '../../types';
import MovieCard from './MovieCard';
import { useWatchProgressStore } from '../../stores';

interface ContinueWatchingRowProps {
  movies: Movie[];
  isLoading?: boolean;
}

export default function ContinueWatchingRow({ movies, isLoading = false }: ContinueWatchingRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { progress } = useWatchProgressStore();

  useEffect(() => {
    if (!isLoading && movies.length > 0) {
      checkScrollPosition();
    }
  }, [movies, isLoading]);

  const checkScrollPosition = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollPosition, 400);
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 md:py-8">
        <div className="px-4 md:px-8 mb-4 flex items-center gap-3">
          <div className="w-1 h-6 bg-brand rounded-full" />
          <div className="w-40 h-7 bg-bg-surface rounded-lg skeleton" />
        </div>
        <div className="flex gap-3 md:gap-4 px-4 md:px-8 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
              <div className="aspect-[2/3] bg-bg-surface rounded-xl skeleton" />
              <div className="mt-3 px-1">
                <div className="w-3/4 h-4 bg-bg-surface rounded-lg skeleton" />
                <div className="w-1/2 h-3 bg-bg-surface rounded-lg skeleton mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="py-6 md:py-8 relative group"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Section Header */}
      <div className="px-4 md:px-8 mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-brand" />
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-text-primary tracking-tight">Continue Watching</h2>
        </div>
      </div>

      {/* Movies Row */}
      <div className="relative">
        {/* Left Arrow */}
        {showArrows && canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-r from-cinematic-dark/90 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110">
              <ChevronLeft className="w-6 h-6 text-text-primary" />
            </div>
          </motion.button>
        )}

        {/* Movie Cards */}
        <div
          ref={rowRef}
          onScroll={checkScrollPosition}
          className="flex gap-3 md:gap-4 px-4 md:px-8 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => {
            const movieProgress = progress[movie.id];
            const progressPercent = movieProgress 
              ? (movieProgress.currentTime / movieProgress.duration) * 100 
              : 0;
            
            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <MovieCard
                  movie={movie}
                  showProgress={!!movieProgress}
                  progress={progressPercent}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Right Arrow */}
        {showArrows && canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-l from-cinematic-dark/90 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110">
              <ChevronRight className="w-6 h-6 text-text-primary" />
            </div>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}