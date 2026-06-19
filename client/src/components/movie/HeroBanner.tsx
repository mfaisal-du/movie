'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play, Info, Heart, Star, Clock, Film, Clapperboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '../../types';
import { useMyListStore } from '../../stores';
import FallbackImage from '../ui/FallbackImage';

interface HeroBannerProps {
  movies: Movie[];
  isLoading: boolean;
}

export default function HeroBanner({ movies, isLoading }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { toggleMovie, isInList } = useMyListStore();

  const rotateSlide = useCallback(() => {
    if (!isPaused && movies.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }
  }, [isPaused, movies.length]);

  useEffect(() => {
    const interval = setInterval(rotateSlide, 8000);
    return () => clearInterval(interval);
  }, [rotateSlide]);

  const goToPrevious = () => {
    if (movies.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    }
  };

  const goToNext = () => {
    if (movies.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }
  };

  // Welcome screen
  if (!isLoading && movies.length === 0) {
    return (
      <div className="relative h-[60vh] md:h-[70vh] lg:h-[85vh] bg-cinematic-dark overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-cinematic-dark to-brand/20 opacity-80" />
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          />
        </div>
        <div className="absolute inset-0 hero-gradient-bottom" />
        <div className="absolute inset-0 hero-gradient-left" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center px-4 max-w-2xl"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 mx-auto mb-8 rounded-full glass flex items-center justify-center"
            >
              <Clapperboard className="w-12 h-12 text-brand" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4 leading-tight">
              Welcome to <span className="text-gradient-brand">MovieCloud</span>
            </h1>
            <p className="text-lg text-text-secondary mb-8 leading-relaxed">
              Your personal movie streaming platform. Browse, search, and watch thousands of movies instantly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/search"
                className="group flex items-center gap-2 px-7 py-3.5 bg-brand hover:bg-brand-hover text-bg-primary font-bold rounded-xl transition-all duration-300 hover:shadow-brand-glow-lg hover:scale-105"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                Browse Movies
              </Link>
              <div className="flex items-center gap-2 px-5 py-3 glass rounded-xl text-text-secondary">
                <Film className="w-5 h-5" />
                <span className="font-medium">Start Watching</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
              {['No Ads', 'HD Quality', 'Instant Streaming'].map((feature) => (
                <div key={feature} className="px-4 py-2 glass rounded-full text-xs font-medium text-text-secondary">
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading skeleton
  if (isLoading && movies.length === 0) {
    return (
      <div className="relative h-[60vh] md:h-[70vh] lg:h-[85vh] bg-cinematic-dark">
        <div className="absolute inset-0 skeleton" />
        <div className="absolute inset-0 hero-gradient-bottom" />
        <div className="absolute inset-0 hero-gradient-left" />
      </div>
    );
  }

  const currentMovie = movies[currentIndex];
  const inList = isInList(currentMovie.id);

  return (
    <div
      className="relative h-[60vh] md:h-[70vh] lg:h-[85vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <FallbackImage
            src={currentMovie.backdropUrl}
            alt={currentMovie.title}
            title={currentMovie.title}
            year={currentMovie.year}
            type="backdrop"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 hero-gradient-left" />
      <div className="absolute inset-0 hero-gradient-bottom" />
      <div className="absolute inset-0 bg-gradient-to-r from-cinematic-dark/50 to-transparent" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Previous Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={goToPrevious}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 cursor-pointer group"
      >
        <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-text-primary group-hover:text-brand transition-colors" />
      </motion.button>

      {/* Next Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 cursor-pointer group"
      >
        <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-text-primary group-hover:text-brand transition-colors" />
      </motion.button>

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-20 md:pb-28 lg:pb-32 z-10">
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 lg:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              {/* Featured Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-brand/20 backdrop-blur-sm border border-brand/30"
              >
                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <span className="text-xs font-semibold text-brand">Featured</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-hero font-bold text-text-primary mb-4 leading-tight drop-shadow-2xl">
                {currentMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                {currentMovie.rating && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-gold/20 backdrop-blur-sm rounded-md text-accent-gold font-semibold">
                    <Star className="w-4 h-4 fill-accent-gold" />
                    {currentMovie.rating}
                  </span>
                )}
                {currentMovie.year && <span className="text-text-secondary font-medium">{currentMovie.year}</span>}
                {currentMovie.duration && (
                  <span className="flex items-center gap-1.5 text-text-secondary">
                    <Clock className="w-4 h-4" />
                    {Math.floor(currentMovie.duration / 60)}h {currentMovie.duration % 60}m
                  </span>
                )}
                {currentMovie.genres && currentMovie.genres.length > 0 && (
                  <div className="flex items-center gap-2">
                    {currentMovie.genres.slice(0, 3).map((genre, index) => (
                      <span key={index} className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-md text-xs font-medium text-text-secondary">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {currentMovie.synopsis && (
                <p className="text-sm md:text-base text-text-secondary line-clamp-3 mb-6 leading-relaxed drop-shadow-lg">
                  {currentMovie.synopsis}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/watch/${currentMovie.id}`}
                  className="group flex items-center gap-2.5 px-7 py-3.5 bg-brand hover:bg-brand-hover text-bg-primary font-bold rounded-xl transition-all duration-300 hover:shadow-brand-glow-lg hover:scale-105 active:scale-[0.98]"
                >
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                  Play Now
                </Link>
                <Link
                  href={`/movie/${currentMovie.id}`}
                  className="group flex items-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-text-primary font-semibold rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-[0.98]"
                >
                  <Info className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  More Info
                </Link>
                <button
                  onClick={() => toggleMovie(currentMovie.id)}
                  className={`group flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
                    inList
                      ? 'bg-brand text-bg-primary shadow-brand-glow'
                      : 'bg-white/10 hover:bg-white/20 text-text-primary border border-white/10 hover:border-white/20'
                  }`}
                >
                  <Heart className={`w-5 h-5 transition-transform group-hover:scale-125 ${inList ? 'fill-bg-primary' : ''}`} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-4 md:left-8 lg:left-12 flex items-center gap-2 z-10">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-500 ease-out-expo cursor-pointer ${
              index === currentIndex
                ? 'bg-brand w-8 shadow-brand-glow'
                : 'bg-white/30 hover:bg-white/50 w-2'
            }`}
          />
        ))}
      </div>

      {/* Movie Counter */}
      <div className="absolute bottom-8 right-4 md:right-8 lg:right-12 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 z-10">
        <span className="text-xs font-medium text-text-secondary">
          {currentIndex + 1} / {movies.length}
        </span>
      </div>
    </div>
  );
}
