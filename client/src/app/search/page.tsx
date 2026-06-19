'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useSearch } from '../../hooks/useSearch';
import MovieCard from '../../components/movie/MovieCard';
import CinematicBreadcrumb from '../../components/ui/CinematicBreadcrumb';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Search, X, Film, SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react';
import { Movie } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ year: '', minRating: '', sortBy: 'rating' });
  const { results, loading, search, clearSearch } = useSearch(300);

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery, filters);
      setInputValue(initialQuery);
    }
  }, [initialQuery, search]);

  function handleSearchSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (inputValue.trim()) {
      search(inputValue.trim(), filters);
      router.push('/search?q=' + encodeURIComponent(inputValue.trim()));
    }
  }

  function handleClear() {
    setInputValue('');
    clearSearch();
    router.push('/search');
  }

  function runSearch(term: string) {
    setInputValue(term);
    search(term, filters);
    router.push('/search?q=' + encodeURIComponent(term));
  }

  const popularSearches = ['Action', 'Comedy', 'Thriller', 'Sci-Fi', 'Drama'];

  return (
    <div className="min-h-screen bg-cinematic-dark">
      <CinematicBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Search' },
        ]}
        title={initialQuery ? 'Results for "' + initialQuery + '"' : 'Discover Movies'}
        backdropUrl="/images/search.jpg"
        genreSlug="default"
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-12 relative z-10 pb-20">
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="relative group">
            <div
              className="flex items-center bg-[rgba(15,15,35,0.8)] backdrop-blur-2xl rounded-2xl transition-all duration-300 overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-center w-14 h-14 text-text-muted group-focus-within:text-brand transition-colors duration-300">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search movies by title, genre, or year..."
                className="flex-1 bg-transparent pr-4 py-4 text-base text-text-primary placeholder-[rgba(248,250,252,0.3)] outline-none"
                autoFocus
                style={{ outline: 'none', boxShadow: 'none' }}
              />
              {inputValue ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="mr-2 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10 transition-all duration-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
              <button
                type="submit"
                className="mr-3 px-6 py-2.5 bg-brand hover:bg-brand-hover text-bg-primary font-semibold rounded-xl transition-all duration-200 cursor-pointer hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer " + (showFilters ? 'bg-brand/10 text-brand border border-brand/20' : 'bg-[rgba(255,255,255,0.04)] text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.08)]')}
              style={{ border: showFilters ? undefined : '1px solid rgba(255,255,255,0.06)' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            {!initialQuery ? popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => runSearch(term)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200 cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                {term}
              </button>
            )) : null}
          </div>
        </form>

        <AnimatePresence>
          {showFilters ? (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mb-8"
            >
              <div
                className="bg-[rgba(15,15,35,0.7)] backdrop-blur-xl rounded-2xl p-6"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Year</label>
                    <input
                      type="number"
                      placeholder="e.g. 2024"
                      value={filters.year}
                      onChange={(e) => setFilters({...filters, year: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.04)] rounded-xl text-text-primary placeholder-[rgba(248,250,252,0.2)] text-sm"
                      style={{ border: '1px solid rgba(255,255,255,0.06)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Min Rating</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => setFilters({...filters, minRating: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.04)] rounded-xl text-text-primary text-sm cursor-pointer"
                      style={{ border: '1px solid rgba(255,255,255,0.06)', outline: 'none' }}
                    >
                      <option value="" className="bg-bg-primary">Any Rating</option>
                      <option value="7" className="bg-bg-primary">7+ Stars</option>
                      <option value="8" className="bg-bg-primary">8+ Stars</option>
                      <option value="9" className="bg-bg-primary">9+ Stars</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.04)] rounded-xl text-text-primary text-sm cursor-pointer"
                      style={{ border: '1px solid rgba(255,255,255,0.06)', outline: 'none' }}
                    >
                      <option value="rating" className="bg-bg-primary">Top Rated</option>
                      <option value="year" className="bg-bg-primary">Newest</option>
                      <option value="added_at" className="bg-bg-primary">Recently Added</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-2 border-white/10 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-text-muted font-medium">Searching movies...</p>
          </div>
        ) : initialQuery && results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-20 h-20 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center mb-6" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <Film className="w-8 h-8 text-[rgba(248,250,252,0.15)]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
            <p className="text-text-muted mb-6">We could not find anything matching &quot;{initialQuery}&quot;</p>
            <button
              onClick={handleClear}
              className="px-6 py-2.5 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-text-secondary hover:text-text-primary rounded-xl transition-all duration-200 cursor-pointer text-sm font-medium"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Clear search
            </button>
          </motion.div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                <p className="text-sm text-text-secondary">
                  Found <span className="text-brand font-semibold">{results.length}</span> {results.length === 1 ? 'movie' : 'movies'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((movie: Movie, index: number) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-[rgba(34,197,94,0.06)] flex items-center justify-center" style={{ border: '1px solid rgba(34,197,94,0.1)' }}>
                <Search className="w-10 h-10 text-brand/40" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-brand/5"
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Discover Movies</h2>
            <p className="text-text-muted max-w-md text-center mb-8">
              Search by title, genre, or year to find your next favorite film
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-text-muted">
                <TrendingUp className="w-3.5 h-3.5" />
                Popular:
              </span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => runSearch(term)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200 cursor-pointer"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cinematic-dark flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
