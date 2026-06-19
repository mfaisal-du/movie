'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Movie, ApiResponse } from '../types';

interface UseMovieResult {
  movie: Movie | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMovie(id: string | undefined): UseMovieResult {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovie = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
try {
        const response = await api.get<ApiResponse<Movie>>(`/movies/${id}`);
        const movieWithImages = {
          ...response.data,
          posterUrl: response.data.posterUrl || `https://source.unsplash.com/500x750/?movie,${encodeURIComponent(response.data.title || id)}`,
          backdropUrl: response.data.backdropUrl || `https://source.unsplash.com/1280x720/?cinema,movie,${encodeURIComponent(response.data.title || id)}`,
        };
        setMovie(movieWithImages);
      } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movie');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovie();
  }, [id]);

  return { movie, loading, error, refetch: fetchMovie };
}