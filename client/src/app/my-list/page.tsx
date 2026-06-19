'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMyListStore } from '../../stores';
import { api } from '../../lib/api';
import MovieCard from '../../components/movie/MovieCard';
import CinematicBreadcrumb from '../../components/ui/CinematicBreadcrumb';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Film, Plus, Heart } from 'lucide-react';
import { Movie, ApiResponse } from '../../types';
import { motion } from 'framer-motion';

export default function MyListPage() {
  const router = useRouter();
  const { movieIds } = useMyListStore();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      if (movieIds.length === 0) {
        setMovies([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch each movie individually
        const moviePromises = movieIds.map(id =>
          api.get<ApiResponse<Movie>>(`/movies/${id}`)
        );
        
        const responses = await Promise.allSettled(moviePromises);
        const fetchedMovies = responses
          .filter((response): response is PromiseFulfilledResult<ApiResponse<Movie>> => 
            response.status === 'fulfilled'
          )
          .map(response => response.value.data);
        
        setMovies(fetchedMovies);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [movieIds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cinematic-dark">
        <CinematicBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'My List' },
          ]}
          title="My List"
        />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cinematic-dark">
        <CinematicBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'My List' },
          ]}
          title="My List"
        />
        <div className="flex flex-col items-center justify-center gap-6 p-8 py-20">
          <div className="w-24 h-24 rounded-full bg-bg-surface flex items-center justify-center">
            <Heart className="w-12 h-12 text-text-muted" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Error loading your list</h2>
            <p className="text-text-muted max-w-md">{error}</p>
          </div>
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
          { label: 'My List' },
        ]}
        title="My List"
        genreSlug="romance"
      />

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        {movies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bg-surface flex items-center justify-center">
              <Heart className="w-12 h-12 text-text-muted" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Your list is empty</h2>
            <p className="text-text-muted max-w-md mx-auto mb-8">
              Start adding movies to your list to watch them later. Browse our collection and save your favorites!
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-brand hover:bg-brand-hover text-bg-primary font-bold shadow-brand-glow hover:shadow-brand-glow-lg transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Browse Movies
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie, index) => (
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
        )}
      </div>
    </div>
  );
}
