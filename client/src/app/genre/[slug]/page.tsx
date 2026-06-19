'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useMovies } from '../../../hooks/useMovies';
import MovieCard from '../../../components/movie/MovieCard';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import CinematicBreadcrumb from '../../../components/ui/CinematicBreadcrumb';
import { ArrowLeft, ChevronDown, Film, ArrowRight } from 'lucide-react';
import { Movie } from '../../../types';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SORT_OPTIONS = [
  { value: 'added_at', label: 'Recently Added' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'rating', label: 'Rating' },
  { value: 'year', label: 'Year' },
];

const GENRE_POSTERS: Record<string, string> = {
  action: '/images/Action.jpeg',
  comedy: '/images/COmedy.jpeg',
  drama: '/images/Drama.jpeg',
  horror: '/images/Horror.jpeg',
  'sci-fi': '/images/scifi.JPG',
  thriller: '/images/Thriller.JPG',
  animation: '/images/Animated.jpeg',
  '18+': '/images/18+.jpeg',
};

export default function GenrePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
   
  const [sort, setSort] = useState('added_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [showSortMenu, setShowSortMenu] = useState(false);
   
  const { movies, pagination, loading, error } = useMovies({
    genre: slug,
    sort,
    order,
    page,
    limit: 20,
  });

  useEffect(() => {
    if (page === 1) {
      setAllMovies(movies);
    } else {
      setAllMovies(prev => [...prev, ...movies]);
    }
  }, [movies, page]);

  const loadMore = useCallback(() => {
    if (pagination && page < pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  }, [pagination, page]);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setOrder(newSort === 'title' ? 'asc' : 'desc');
    setPage(1);
    setAllMovies([]);
    setShowSortMenu(false);
  };

  const formatGenreName = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-cinematic-dark">
        <CinematicBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Genres', href: '/' },
            { label: formatGenreName(slug) },
          ]}
          title={formatGenreName(slug)}
        />
        <div className="flex flex-col items-center justify-center gap-6 p-8 py-20">
          <div className="w-24 h-24 rounded-full bg-bg-surface flex items-center justify-center">
            <Film className="w-12 h-12 text-text-muted" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Error loading genre</h2>
            <p className="text-text-muted max-w-md">{error}</p>
          </div>
          <Button onClick={() => router.back()} variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinematic-dark">
      {/* Cinematic Breadcrumb Header */}
      <CinematicBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Genres', href: '/' },
          { label: formatGenreName(slug) },
        ]}
        backdropUrl={GENRE_POSTERS[slug]}
        title={formatGenreName(slug)}
        genreSlug={slug}
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        {/* Movie Count & Sort */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {pagination && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-text-muted"
              >
                <span className="text-brand font-bold">{pagination.total}</span> movie{pagination.total !== 1 ? 's' : ''}
              </motion.p>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              Sort by: {SORT_OPTIONS.find(opt => opt.value === sort)?.label}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl shadow-xl overflow-hidden z-20"
              >
                <div className="p-2">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full px-4 py-2.5 text-left text-sm rounded-lg transition-all duration-200 cursor-pointer ${
                        sort === option.value
                          ? 'bg-brand/20 text-brand font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Movie Grid */}
        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-text-muted">Loading movies...</p>
          </div>
        ) : allMovies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bg-surface flex items-center justify-center">
              <Film className="w-12 h-12 text-text-muted" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">No movies found</h2>
            <p className="text-text-muted max-w-md mx-auto">
              There are no movies in this genre yet. Check back later!
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {allMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                >
                  <MovieCard key={movie.id} movie={movie} />
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {pagination && page < pagination.totalPages && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-12"
              >
                <Button
                  onClick={loadMore}
                  variant="secondary"
                  size="lg"
                  disabled={loading}
                  className="glass hover:bg-white/20 font-semibold border-white/10"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Load More
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
