'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Heart, Clock, Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Movie } from '../../types';
import { useMyListStore } from '../../stores';
import FallbackImage from '../ui/FallbackImage';
import toast from 'react-hot-toast';

interface MovieCardProps {
  movie: Movie;
  showProgress?: boolean;
  progress?: number;
}

export default function MovieCard({ movie, showProgress = false, progress = 0 }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { toggleMovie, isInList } = useMyListStore();
  const inList = isInList(movie.id);

  return (
    <motion.div
      ref={ref}
      className="relative flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[220px] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, y: -12 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/movie/${movie.id}`} className="block cursor-pointer">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-surface shadow-card transition-shadow duration-300 group-hover:shadow-card-hover-brand">
          {/* Poster Image */}
          {!inView ? (
            <div className="w-full h-full bg-bg-surface rounded-xl skeleton" />
          ) : (
            <FallbackImage
              src={movie.posterUrl}
              alt={movie.title}
              title={movie.title}
              year={movie.year}
              type="poster"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-cinematic-dark via-cinematic-dark/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

          {/* Centered Play Button - Always on hover */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-brand/90 backdrop-blur-sm flex items-center justify-center shadow-brand-glow transition-all duration-300 hover:bg-brand hover:scale-110 hover:shadow-brand-glow-lg cursor-pointer">
              <Play className="w-7 h-7 md:w-8 md:h-8 text-bg-primary ml-1" fill="currentColor" />
            </div>
          </motion.div>

          {/* Bottom Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-10">
            <div className="flex items-center justify-between">
              {/* Movie Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-text-primary line-clamp-1 drop-shadow-lg">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-text-secondary mt-0.5">
                  {movie.rating && (
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-accent-gold fill-accent-gold" />
                      <span className="font-medium">{movie.rating}</span>
                    </span>
                  )}
                  {movie.year && <span>{movie.year}</span>}
                </div>
              </div>

              {/* Heart Button */}
<button
                 className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 cursor-pointer ${
                   inList ? 'bg-brand text-bg-primary' : 'bg-white/20 text-white hover:bg-white/30'
                 }`}
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   toggleMovie(movie.id);
                   toast.success(
                     inList 
                       ? `${movie.title} removed from My List` 
                       : `${movie.title} added to My List`,
                     {
                       icon: inList ? '✕' : '✓',
                       position: 'bottom-right',
                       duration: 3000,
                     }
                   );
                 }}
               >
                 <Heart className={`w-4 h-4 ${inList ? 'fill-bg-primary' : ''}`} />
               </button>
            </div>
          </div>

          {/* Quality Badge */}
          {movie.quality && (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-brand/90 backdrop-blur-sm rounded-md text-[10px] font-bold text-bg-primary shadow-lg z-10">
              {movie.quality}
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
              <div
                className="h-full bg-brand transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Shine Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
