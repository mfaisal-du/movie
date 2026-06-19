'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Movie, ApiResponse } from '../types';

interface UseFeaturedMoviesResult {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFeaturedMovies(): UseFeaturedMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = async () => {
    setLoading(true);
    setError(null);
    
try {
        const response = await api.get<ApiResponse<{ movies: Movie[] }>>('/movies/featured');
        const moviesWithImages = (response.data.movies || []).map(m => ({
          ...m,
          posterUrl: m.posterUrl || `https://source.unsplash.com/500x750/?movie,${encodeURIComponent(m.title || m.id)}`,
          backdropUrl: m.backdropUrl || `https://source.unsplash.com/1280x720/?cinema,movie,${encodeURIComponent(m.title || m.id)}`,
        }));
        setMovies(moviesWithImages);
      } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  return { movies, loading, error, refetch: fetchFeatured };
}