import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Movie } from '../types';

interface MyListState {
  movieIds: string[];
  addMovie: (id: string) => void;
  removeMovie: (id: string) => void;
  toggleMovie: (id: string) => void;
  isInList: (id: string) => boolean;
}

export const useMyListStore = create<MyListState>()(
  persist(
    (set, get) => ({
      movieIds: [],

      addMovie: (id: string) =>
        set((state) => ({
          movieIds: state.movieIds.includes(id)
            ? state.movieIds
            : [...state.movieIds, id],
        })),

      removeMovie: (id: string) =>
        set((state) => ({
          movieIds: state.movieIds.filter((mid) => mid !== id),
        })),

      toggleMovie: (id: string) => {
        const { movieIds, addMovie, removeMovie } = get();
        movieIds.includes(id) ? removeMovie(id) : addMovie(id);
      },

      isInList: (id: string) => get().movieIds.includes(id),
    }),
    { name: 'moviecloud-my-list' }
  )
);

interface WatchProgressState {
  progress: Record<string, { currentTime: number; duration: number; lastWatched: string }>;
  updateProgress: (movieId: string, currentTime: number, duration: number) => void;
  removeProgress: (movieId: string) => void;
  getProgress: (movieId: string) => { currentTime: number; duration: number; lastWatched: string } | null;
}

export const useWatchProgressStore = create<WatchProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      updateProgress: (movieId: string, currentTime: number, duration: number) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [movieId]: {
              currentTime,
              duration,
              lastWatched: new Date().toISOString(),
            },
          },
        })),

      removeProgress: (movieId: string) =>
        set((state) => {
          const { [movieId]: _, ...rest } = state.progress;
          return { progress: rest };
        }),

      getProgress: (movieId: string) => get().progress[movieId] || null,
    }),
    { name: 'moviecloud-watch-progress' }
  )
);

interface UIState {
  isHeaderScrolled: boolean;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  setIsHeaderScrolled: (value: boolean) => void;
  setIsSearchOpen: (value: boolean) => void;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isHeaderScrolled: false,
  isSearchOpen: false,
  isMobileMenuOpen: false,
  setIsHeaderScrolled: (value) => set({ isHeaderScrolled: value }),
  setIsSearchOpen: (value) => set({ isSearchOpen: value }),
  setIsMobileMenuOpen: (value) => set({ isMobileMenuOpen: value }),
}));
