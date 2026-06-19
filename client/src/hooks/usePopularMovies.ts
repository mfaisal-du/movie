'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Movie, ApiResponse } from '../types';

interface UsePopularMoviesResult {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePopularMovies(limit = 20): UsePopularMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopular = async () => {
    setLoading(true);
    setError(null);
    
try {
        const response = await api.get<ApiResponse<{ movies: Movie[] }>>(`/movies/popular?limit=${limit}`);
        const moviesWithImages = (response.data.movies || []).map(m => ({
          ...m,
          posterUrl: m.posterUrl || `https://source.unsplash.com/500x750/?movie,${encodeURIComponent(m.title || m.id)}`,
        }));
        setMovies(moviesWithImages);
      } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopular();
  }, [limit]);

  return { movies, loading, error, refetch: fetchPopular };
}