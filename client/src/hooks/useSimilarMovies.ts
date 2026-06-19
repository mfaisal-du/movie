'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Movie, ApiResponse } from '../types';

interface UseSimilarMoviesResult {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSimilarMovies(id: string | undefined, limit = 12): UseSimilarMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilar = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
try {
        const response = await api.get<ApiResponse<{ movies: Movie[] }>>(`/movies/${id}/similar?limit=${limit}`);
        const moviesWithImages = (response.data.movies || []).map(m => ({
          ...m,
          posterUrl: m.posterUrl || `https://source.unsplash.com/500x750/?movie,${encodeURIComponent(m.title || m.id)}`,
        }));
        setMovies(moviesWithImages);
      } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch similar movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimilar();
  }, [id, limit]);

  return { movies, loading, error, refetch: fetchSimilar };
}