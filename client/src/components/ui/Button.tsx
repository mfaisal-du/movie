'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-brand hover:bg-brand-hover text-bg-primary focus:ring-brand shadow-brand-glow hover:shadow-brand-glow-lg',
      secondary: 'bg-white/10 hover:bg-white/20 text-text-primary focus:ring-white/30 border border-white/10 hover:border-white/20',
      ghost: 'bg-transparent hover:bg-white/10 text-text-secondary hover:text-text-primary focus:ring-white/20',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-5 py-2.5 text-base rounded-xl',
      lg: 'px-7 py-3.5 text-lg rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cinematic-dark active:scale-[0.98] cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
