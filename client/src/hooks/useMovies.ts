'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Movie, ApiResponse, PaginatedResponse } from '../types';

interface UseMoviesOptions {
  page?: number;
  limit?: number;
  genre?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

interface UseMoviesResult {
  movies: Movie[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMovies(options: UseMoviesOptions = {}): UseMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pagination, setPagination] = useState<UseMoviesResult['pagination']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const fetchMovies = async () => {
    setLoading(true);
    setError(null);
     
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.genre) params.append('genre', options.genre);
      if (options.sort) params.append('sort', options.sort);
      if (options.order) params.append('order', options.order);
      if (options.search) params.append('q', options.search);

      const queryString = params.toString();
      let url: string;
      
      if (options.search) {
        url = `/movies/search?${queryString}`;
      } else {
        url = `/movies${queryString ? `?${queryString}` : ''}`;
      }
      
      const response = await api.get<PaginatedResponse<Movie>>(url);
      setMovies(response.data.movies || []);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [options.page, options.limit, options.genre, options.sort, options.order, options.search]);

  return { movies, pagination, loading, error, refetch: fetchMovies };
}