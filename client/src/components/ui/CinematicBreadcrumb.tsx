'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
  posterUrl?: string;
}

interface CinematicBreadcrumbProps {
  items: BreadcrumbItem[];
  backdropUrl?: string;
  title?: string;
  genreSlug?: string;
}

// Genre-specific color gradients and accent colors
const genreThemes: Record<string, { gradient: string; accent: string; glow: string; particles: string }> = {
  action: {
    gradient: 'from-red-900/80 via-red-800/40 to-orange-900/60',
    accent: '#EF4444',
    glow: 'shadow-red-500/30',
    particles: 'bg-red-400',
  },
  comedy: {
    gradient: 'from-yellow-900/80 via-amber-800/40 to-orange-900/60',
    accent: '#F59E0B',
    glow: 'shadow-yellow-500/30',
    particles: 'bg-yellow-400',
  },
  drama: {
    gradient: 'from-indigo-900/80 via-purple-800/40 to-blue-900/60',
    accent: '#8B5CF6',
    glow: 'shadow-purple-500/30',
    particles: 'bg-purple-400',
  },
  horror: {
    gradient: 'from-red-950/80 via-red-900/50 to-black/80',
    accent: '#DC2626',
    glow: 'shadow-red-700/40',
    particles: 'bg-red-600',
  },
  'sci-fi': {
    gradient: 'from-cyan-900/80 via-blue-800/40 to-indigo-900/60',
    accent: '#06B6D4',
    glow: 'shadow-cyan-500/30',
    particles: 'bg-cyan-400',
  },
  scifi: {
    gradient: 'from-cyan-900/80 via-blue-800/40 to-indigo-900/60',
    accent: '#06B6D4',
    glow: 'shadow-cyan-500/30',
    particles: 'bg-cyan-400',
  },
  thriller: {
    gradient: 'from-slate-900/80 via-gray-800/40 to-zinc-900/60',
    accent: '#64748B',
    glow: 'shadow-slate-500/30',
    particles: 'bg-slate-400',
  },
  animation: {
    gradient: 'from-pink-900/80 via-fuchsia-800/40 to-purple-900/60',
    accent: '#EC4899',
    glow: 'shadow-pink-500/30',
    particles: 'bg-pink-400',
  },
  romance: {
    gradient: 'from-pink-900/80 via-rose-800/40 to-red-900/60',
    accent: '#F43F5E',
    glow: 'shadow-rose-500/30',
    particles: 'bg-rose-400',
  },
  adventure: {
    gradient: 'from-emerald-900/80 via-teal-800/40 to-green-900/60',
    accent: '#10B981',
    glow: 'shadow-emerald-500/30',
    particles: 'bg-emerald-400',
  },
  fantasy: {
    gradient: 'from-violet-900/80 via-purple-800/40 to-indigo-900/60',
    accent: '#7C3AED',
    glow: 'shadow-violet-500/30',
    particles: 'bg-violet-400',
  },
  documentary: {
    gradient: 'from-teal-900/80 via-cyan-800/40 to-sky-900/60',
    accent: '#14B8A6',
    glow: 'shadow-teal-500/30',
    particles: 'bg-teal-400',
  },
  default: {
    gradient: 'from-purple-900/80 via-indigo-800/40 to-blue-900/60',
    accent: '#8B5CF6',
    glow: 'shadow-purple-500/30',
    particles: 'bg-purple-400',
  },
};

// Floating particle component
function FloatingParticle({ color, delay, size, x, duration }: { color: string; delay: number; size: number; x: number; duration: number }) {
  return (
    <motion.div
      className={`absolute rounded-full ${color}`}
      style={{ width: size, height: size, left: `${x}%`, bottom: 0 }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [0, -100, -250, -400],
        x: [0, 30, -20, 15, 0],
        opacity: [0, 0.8, 0.7, 0.5, 0],
        scale: [0.5, 1.2, 1, 0.8, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

// Glowing orb component
function GlowingOrb({ color, delay, x, y, size }: { color: string; delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
        filter: 'blur(30px)',
      }}
      animate={{
        x: [0, 50, -40, 30, 0],
        y: [0, -30, 40, -20, 0],
        scale: [1, 1.3, 0.8, 1.2, 1],
        opacity: [0.35, 0.55, 0.35, 0.45, 0.35],
      }}
      transition={{
        duration: 10,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function CinematicBreadcrumb({ items, backdropUrl, title, genreSlug }: CinematicBreadcrumbProps) {
  const [currentPoster, setCurrentPoster] = useState(backdropUrl);
  const [isHovered, setIsHovered] = useState(false);

  const theme = useMemo(() => {
    const slug = genreSlug?.toLowerCase() || '';
    return genreThemes[slug] || genreThemes.default;
  }, [genreSlug]);

  // Generate particles
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: i * 0.3,
      size: 4 + Math.random() * 8,
      x: Math.random() * 100,
      duration: 5 + Math.random() * 4,
    }));
  }, []);

  // Animate through posters if multiple items have them
  useEffect(() => {
    const posters = items.filter(item => item.posterUrl).map(item => item.posterUrl);
    if (posters.length <= 1) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % posters.length;
      setCurrentPoster(posters[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, [items]);

  return (
    <MotionConfig reducedMotion="never">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-56 md:h-64 lg:h-80 overflow-hidden pb-20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      {/* Animated Background Poster */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPoster || 'default'}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {currentPoster ? (
            <img
              src={currentPoster}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${theme.gradient}`} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Genre-specific gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

      {/* Lighter dark overlays - less opacity to show particles */}
      <div className="absolute inset-0 bg-gradient-to-b from-cinematic-dark/40 via-cinematic-dark/20 to-cinematic-dark/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-cinematic-dark/30 via-transparent to-cinematic-dark/30" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 10 }}>
        {particles.map((p) => (
          <FloatingParticle
            key={p.id}
            color={theme.particles}
            delay={p.delay}
            size={p.size}
            x={p.x}
            duration={p.duration}
          />
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
        <GlowingOrb color={theme.accent} delay={0} x={15} y={30} size={200} />
        <GlowingOrb color={theme.accent} delay={2} x={75} y={50} size={160} />
        <GlowingOrb color={theme.accent} delay={4} x={50} y={20} size={180} />
      </div>

      {/* Noise Texture */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Content */}
      <div className="relative h-full max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col justify-end pb-6">
        {/* Breadcrumb Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-1.5 text-sm md:text-base mb-3"
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isFirst = index === 0;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + (index * 0.08), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center"
              >
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/25 mx-1.5" />
                )}
                
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                  >
                    {isFirst && <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-white font-semibold">
                    {isFirst && <Home className="w-3.5 h-3.5" />}
                    {item.label}
                  </span>
                )}
              </motion.div>
            );
          })}
        </motion.nav>

        {/* Page Title */}
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl"
            style={{ textShadow: '0 2px 30px rgba(0,0,0,0.5), 0 0 60px ' + theme.accent + '25' }}
          >
            {title}
          </motion.h1>
        )}
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cinematic-dark to-transparent" />
    </motion.div>
    </MotionConfig>
  );
}
