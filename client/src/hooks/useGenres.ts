'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Genre, ApiResponse } from '../types';

interface UseGenresResult {
  genres: Genre[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGenres(): UseGenresResult {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenres = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<ApiResponse<{ genres: Genre[] }>>('/genres');
      setGenres(response.data.genres);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch genres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  return { genres, loading, error, refetch: fetchGenres };
}