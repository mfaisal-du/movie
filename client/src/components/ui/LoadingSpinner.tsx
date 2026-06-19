'use client';

import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-14 h-14',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-white/10',
        )}
      />
      <div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent border-t-brand animate-spin',
        )}
      />
    </div>
  );
}
