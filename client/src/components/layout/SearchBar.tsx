'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, Star, Film, TrendingUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores';
import { SearchResult } from '../../types';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isSearchOpen, setIsSearchOpen } = useUIStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('moviecloud-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/v1/movies/search?q=${encodeURIComponent(query)}&limit=6`);
          const data = await res.json();
          if (data.success) {
            setResults(data.data.movies);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('moviecloud-recent-searches', JSON.stringify(updated));
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsFocused(false);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative search-container">
      {/* Search Input */}
      <div
        className="relative flex items-center"
      >
        <div
          className={`flex items-center rounded-xl transition-all duration-300 ease-out ${
            isFocused
              ? 'w-72 md:w-[420px] bg-[rgba(15,15,35,0.85)] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
              : 'w-48 md:w-64 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)]'
          }`}
        >
          <div className={`flex items-center justify-center w-10 h-10 transition-colors duration-300 ${isFocused ? 'text-brand' : 'text-text-muted'}`}>
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search movies..."
            className="flex-1 bg-transparent pr-4 py-2.5 text-sm text-text-primary placeholder-[rgba(248,250,252,0.35)] outline-none focus:outline-none focus:ring-0"
            style={{ outline: 'none', boxShadow: 'none' }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="mr-3 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-2 w-full max-h-[420px] overflow-y-auto bg-[rgba(15,15,35,0.92)] backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Search Results */}
            {query.trim().length > 0 && results.length > 0 ? (
              <div className="p-3">
                <div className="px-3 py-2 mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Results</span>
                  <span className="text-xs text-brand">{results.length} found</span>
                </div>
                {results.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => {
                      router.push(`/movie/${movie.id}`);
                      setIsFocused(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-xl transition-all duration-200 group cursor-pointer"
                  >
                    <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-bg-surface border border-white/10">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <Film className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
                        {movie.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                        {movie.year && <span>{movie.year}</span>}
                        {movie.genres?.[0] && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-text-muted" />
                            <span>{movie.genres[0]}</span>
                          </>
                        )}
                        {movie.rating && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-text-muted" />
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-accent-gold fill-accent-gold" />
                              {movie.rating}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-brand transition-all duration-200" />
                  </button>
                ))}
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-2 text-sm font-semibold text-brand hover:bg-[rgba(34,197,94,0.1)] rounded-xl transition-all duration-200 cursor-pointer"
                  style={{ border: '1px solid rgba(34,197,94,0.15)' }}
                >
                  See all results
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : query.trim().length > 0 && isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-text-muted">Searching...</p>
              </div>
            ) : query.trim().length > 0 && results.length === 0 ? (
              <div className="p-8 text-center">
                <Film className="w-10 h-10 mx-auto mb-3 text-[rgba(248,250,252,0.15)]" />
                <p className="text-sm font-medium text-text-muted">No results found</p>
                <p className="text-xs text-[rgba(203,213,225,0.4)] mt-1">Try a different search term</p>
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="p-3">
                <div className="px-3 py-2 mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Recent
                  </span>
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('moviecloud-recent-searches');
                    }}
                    className="text-xs text-brand hover:text-brand-hover transition-colors cursor-pointer font-medium"
                  >
                    Clear all
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-white/10 rounded-xl transition-all duration-200 text-left group cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-text-muted group-hover:text-brand transition-colors" />
                    <span className="font-medium flex-1">{search}</span>
                    <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
                  <Search className="w-5 h-5 text-[rgba(248,250,252,0.2)]" />
                </div>
                <p className="text-sm font-medium text-text-muted">Start typing to search</p>
                <p className="text-xs text-[rgba(203,213,225,0.5)] mt-1">Search by title, genre, or year</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
