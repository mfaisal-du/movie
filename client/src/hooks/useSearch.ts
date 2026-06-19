import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Movie, ApiResponse } from '../types';

interface SearchFilters {
  year?: string;
  minRating?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface UseSearchResult {
  results: Movie[];
  loading: boolean;
  error: string | null;
  search: (query: string, filters?: SearchFilters) => void;
  clearSearch: () => void;
  query: string;
}

export function useSearch(debounceMs = 300): UseSearchResult {
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Fetch results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          limit: '20',
          ...filters,
        });
        const response = await api.get<ApiResponse<{movies: Movie[], pagination: any}>>(`/movies/search?${params}`);
        const moviesWithImages = (response.data.movies || []).map(m => ({
          ...m,
          posterUrl: m.posterUrl || `https://source.unsplash.com/500x750/?movie,${encodeURIComponent(m.title || m.id)}`,
        }));
        setResults(moviesWithImages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, filters]);

  const search = useCallback((newQuery: string, newFilters?: SearchFilters) => {
    setQuery(newQuery);
    if (newFilters) setFilters(newFilters);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setResults([]);
  }, []);

  return { results, loading, error, search, clearSearch, query };
}