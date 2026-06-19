'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMovie } from '../../../hooks/useMovie';
import { useSimilarMovies } from '../../../hooks/useSimilarMovies';
import { useMyListStore } from '../../../stores';
import MovieRow from '../../../components/movie/MovieRow';
import CinematicBreadcrumb from '../../../components/ui/CinematicBreadcrumb';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Play, Plus, Check, Share2, Clock, Star, Film, Subtitles, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;
    
  const { movie, loading, error } = useMovie(movieId);
  const { movies: similarMovies, loading: similarLoading } = useSimilarMovies(movieId);
  const { isInList, toggleMovie } = useMyListStore();
  const [posterError, setPosterError] = useState(false);

  const inList = isInList(movieId);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!', { icon: '🔗', position: 'bottom-right', duration: 2000 });
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cinematic-dark flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-cinematic-dark">
        <CinematicBreadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Movie Not Found' }]}
          title="Movie Not Found"
        />
        <div className="flex flex-col items-center justify-center gap-6 p-8 py-20">
          <div className="w-24 h-24 rounded-full bg-bg-surface flex items-center justify-center">
            <Film className="w-12 h-12 text-text-muted" />
          </div>
          <Button onClick={() => router.push('/')} variant="secondary">Browse Movies</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinematic-dark">
      <CinematicBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: movie.genres?.[0] || 'Movies', href: movie.genreSlugs?.[0] ? `/genre/${movie.genreSlugs[0]}` : '/' },
          { label: movie.title },
        ]}
        backdropUrl={movie.backdropUrl || movie.posterUrl || undefined}
        title={movie.title}
        genreSlug={movie.genreSlugs?.[0]}
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 pb-16 pt-8 md:pt-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex-shrink-0 w-full max-w-[240px] md:max-w-[280px] lg:max-w-[320px] mx-auto lg:mx-0">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10">
              {movie.posterUrl && !posterError ? (
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" onError={() => setPosterError(true)} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent-purple to-brand flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{movie.title}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display text-text-primary">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3">
              {movie.year && <span className="text-text-secondary">{movie.year}</span>}
              {movie.rating && typeof movie.rating === 'number' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-gold/20 rounded-md">
                  <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
                  <span className="font-semibold text-accent-gold">{movie.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {movie.quality && <span className="px-3 py-1.5 bg-brand text-bg-primary rounded-lg text-sm font-bold">{movie.quality}</span>}
              {movie.duration && <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg"><Clock className="w-4 h-4" /><span>{formatDuration(movie.duration)}</span></div>}
            </div>

            {movie.synopsis && <p className="text-text-secondary max-w-3xl leading-relaxed">{movie.synopsis}</p>}

            <div className="flex flex-wrap gap-4 pt-4">
              <Button onClick={() => router.push(`/watch/${movie.id}`)} className="bg-brand hover:bg-brand-hover">
                <Play className="w-5 h-5 mr-2 fill-current" /> Play Now
              </Button>
              <Button onClick={() => toggleMovie(movie.id)} variant="secondary">
                {inList ? <><Check className="w-5 h-5 mr-2" /> In My List</> : <><Plus className="w-5 h-5 mr-2" /> Add to My List</>}
              </Button>
            </div>
          </div>
        </div>

        {similarMovies.length > 0 && (
          <div className="mt-12">
            <MovieRow title="Similar Movies" movies={similarMovies} isLoading={similarLoading} />
          </div>
        )}
      </div>
    </div>
  );
}