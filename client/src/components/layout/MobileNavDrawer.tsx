'use client';

import Link from 'next/link';
import { X, Home, Film, Heart, ChevronRight, Clapperboard } from 'lucide-react';
import { useUIStore } from '../../stores';
import { motion, AnimatePresence } from 'framer-motion';

const genres = [
  { name: 'Action', slug: 'action', icon: '🎬' },
  { name: 'Animation', slug: 'animation', icon: '✨' },
  { name: 'Comedy', slug: 'comedy', icon: '😄' },
  { name: 'Drama', slug: 'drama', icon: '🎭' },
  { name: 'Horror', slug: 'horror', icon: '👻' },
  { name: 'Sci-Fi', slug: 'sci-fi', icon: '🚀' },
  { name: 'Thriller', slug: 'thriller', icon: '🔪' },
];

export default function MobileNavDrawer() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useUIStore();

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-cinematic-dark/80 backdrop-blur-sm z-overlay md:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-72 glass-strong z-modal md:hidden"
          >
            <div className="p-4 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Clapperboard className="w-6 h-6 text-brand" />
                  <span className="text-lg font-display">
                    Movie<span className="text-brand">Cloud</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/10 text-text-primary hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-white/10 rounded-xl transition-all duration-200 group cursor-pointer"
                >
                  <Home className="w-5 h-5 text-brand group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Home</span>
                </Link>

                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Genres</p>
                </div>

                <div className="space-y-1">
                  {genres.map((genre) => (
                    <Link
                      key={genre.slug}
                      href={`/genre/${genre.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/10 rounded-xl transition-all duration-200 group cursor-pointer"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">{genre.icon}</span>
                      <span className="font-medium">{genre.name}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  ))}
                </div>

                <div className="pt-4">
                  <div className="border-t border-white/10" />
                </div>

                <Link
                  href="/my-list"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-white/10 rounded-xl transition-all duration-200 group cursor-pointer"
                >
                  <Heart className="w-5 h-5 text-brand group-hover:scale-110 transition-transform" />
                  <span className="font-medium">My List</span>
                </Link>
              </nav>

              {/* Footer */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-text-muted text-center">
                  MovieCloud v1.0
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
