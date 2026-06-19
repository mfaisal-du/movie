export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number | null;
  duration: number | null;
  synopsis: string | null;
  rating: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl?: string;
  quality?: string;
  audioInfo?: string;
  hasSubtitles: boolean;
  language?: string;
  filePath: string;
  fileName: string;
  fileSize: number | null;
  cast?: string[] | null;
  director?: string | null;
  viewCount: number;
  featured: boolean;
  isActive: boolean;
  addedAt: string;
  updatedAt: string;
  genres?: string[];
  genreSlugs?: string[];
  source?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    movies: Movie[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  movieCount: number;
}

export interface SearchResult {
  id: string;
  title: string;
  year: number | null;
  rating: number | null;
  posterUrl: string | null;
  genres?: string[];
  quality?: string;
  duration?: number | null;
}

export interface WatchProgress {
  movieId: string;
  currentTime: number;
  duration: number;
  lastWatched: string;
}

export interface ParsedFilename {
  title: string;
  year: number | null;
  quality: string | null;
  audioInfo: string | null;
  hasSubtitles: boolean;
  source: string | null;
  codec: string | null;
  slug: string;
  extension: string;
}
