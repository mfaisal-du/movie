'use client';

import { useState, useMemo } from 'react';
import { Film, ImageOff } from 'lucide-react';

interface FallbackImageProps {
  src: string | null;
  alt: string;
  title: string;
  year?: number | null;
  type?: 'poster' | 'backdrop';
  className?: string;
}

const gradients = [
  'from-violet-900 via-purple-800 to-indigo-900',
  'from-slate-900 via-zinc-800 to-neutral-900',
  'from-gray-900 via-stone-800 to-zinc-900',
  'from-indigo-950 via-blue-900 to-slate-900',
  'from-purple-950 via-fuchsia-900 to-violet-900',
  'from-teal-950 via-emerald-900 to-green-900',
  'from-rose-950 via-pink-900 to-red-900',
  'from-amber-950 via-orange-900 to-red-900',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function FallbackImage({
  src,
  alt,
  title,
  year,
  type = 'poster',
  className = '',
}: FallbackImageProps) {
  const [imgError, setImgError] = useState(false);
  const gradientIndex = useMemo(() => hashCode(title) % gradients.length, [title]);

  const showImage = src && !imgError;

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  const gradient = gradients[gradientIndex];
  const initials = title
    .split(/[\s\-:]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-4 overflow-hidden ${className}`}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      {/* Decorative film strip */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center px-2 gap-1.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-sm bg-black/30" />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {type === 'poster' ? (
          <>
            <div className="w-16 h-16 mb-3 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <span className="text-2xl font-bold text-white/80">{initials}</span>
            </div>
            <h3 className="text-sm font-bold text-white/90 line-clamp-2 leading-tight mb-1">
              {title}
            </h3>
            {year && (
              <span className="text-xs text-white/50 font-medium">{year}</span>
            )}
          </>
        ) : (
          <>
            <Film className="w-10 h-10 text-white/30 mb-2" />
            <h3 className="text-lg font-bold text-white/80 line-clamp-2 leading-tight">
              {title}
            </h3>
            {year && (
              <span className="text-sm text-white/40 font-medium mt-1">{year}</span>
            )}
          </>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}
