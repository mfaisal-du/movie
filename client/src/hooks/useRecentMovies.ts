'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Movie, ApiResponse } from '../types';

interface UseRecentMoviesResult {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecentMovies(limit = 20): UseRecentMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecent = async () => {
    setLoading(true);
    setError(null);
    
try {
        const response = await api.get<ApiResponse<{ movies: Movie[] }>>(`/movies/recent?limit=${limit}`);
        const moviesWithImages = (response.data.movies || []).map(m => ({
          ...m,
          posterUrl: m.posterUrl || `https://source.unsplash.com/500x750/?movie,${encodeURIComponent(m.title || m.id)}`,
        }));
        setMovies(moviesWithImages);
      } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [limit]);

  return { movies, loading, error, refetch: fetchRecent };
}