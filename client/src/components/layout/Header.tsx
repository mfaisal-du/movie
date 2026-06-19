'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Home, Film, Heart, ChevronDown, Clapperboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores';
import SearchBar from './SearchBar';
import MobileNavDrawer from './MobileNavDrawer';

const genres = [
  { name: 'Action', slug: 'action', icon: '🎬' },
  { name: 'Animation', slug: 'animation', icon: '✨' },
  { name: 'Comedy', slug: 'comedy', icon: '😄' },
  { name: 'Drama', slug: 'drama', icon: '🎭' },
  { name: 'Horror', slug: 'horror', icon: '👻' },
  { name: 'Sci-Fi', slug: 'sci-fi', icon: '🚀' },
  { name: 'Thriller', slug: 'thriller', icon: '🔪' },
];

export default function Header() {
  const { isHeaderScrolled, setIsHeaderScrolled, isMobileMenuOpen, setIsMobileMenuOpen } = useUIStore();
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsHeaderScrolled]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 h-16 md:h-18 transition-all duration-500 ${
          isHeaderScrolled
            ? 'shadow-lg'
            : 'border-b border-white/10'
        }`}
        style={{
          background: isHeaderScrolled
            ? 'rgba(0, 0, 0, 0.8)'
            : 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="max-w-[1400px] mx-auto h-full px-4 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="relative">
              <Clapperboard className="w-7 h-7 text-brand transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-brand/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl md:text-2xl font-display tracking-tight">
              Movie<span className="text-brand">Cloud</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="relative px-4 py-2 text-sm font-medium text-text-primary hover:text-brand transition-colors duration-200 group cursor-pointer"
            >
              Home
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>

            {/* Genre Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsGenreDropdownOpen(true)}
              onMouseLeave={() => setIsGenreDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-primary hover:text-brand transition-colors duration-200 cursor-pointer"
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
              >
                Genre
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isGenreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isGenreDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-0 mt-2 w-56 glass-strong rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-2">
                      {genres.map((genre) => (
                        <Link
                          key={genre.slug}
                          href={`/genre/${genre.slug}`}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/10 rounded-lg transition-all duration-200 group cursor-pointer"
                        >
                          <span className="text-lg">{genre.icon}</span>
                          <span className="font-medium">{genre.name}</span>
                          <ChevronDown className="w-4 h-4 ml-auto -rotate-90 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/my-list"
              className="relative px-4 py-2 text-sm font-medium text-text-primary hover:text-brand transition-colors duration-200 group cursor-pointer"
            >
              My List
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
          </nav>

          {/* Search & Mobile Menu */}
          <div className="flex items-center gap-3">
            <SearchBar />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-text-primary hover:bg-white/20 transition-all duration-200 cursor-pointer"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer />
    </>
  );
}
