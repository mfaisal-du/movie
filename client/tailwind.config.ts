import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand': '#22C55E',
        'brand-hover': '#16A34A',
        'brand-light': '#4ADE80',
        'brand-dark': '#15803D',
        'accent-red': '#E50914',
        'accent-red-hover': '#B20710',
        'bg-primary': '#0F0F23',
        'bg-secondary': '#141432',
        'bg-surface': '#1A1A3E',
        'bg-surface-hover': '#232350',
        'bg-elevated': '#2A2A5C',
        'bg-glass': 'rgba(26, 26, 62, 0.6)',
        'text-primary': '#F8FAFC',
        'text-secondary': '#CBD5E1',
        'text-muted': '#64748B',
        'text-disabled': '#475569',
        'accent-gold': '#FBBF24',
        'accent-green': '#22C55E',
        'accent-blue': '#3B82F6',
        'accent-purple': '#8B5CF6',
        'accent-orange': '#F97316',
        'accent-pink': '#EC4899',
        'cinematic-dark': '#0A0A1A',
        'cinematic-gradient-start': '#0F0F23',
        'cinematic-gradient-mid': '#1A1040',
        'cinematic-gradient-end': '#0F0F23',
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Righteous', 'cursive'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'hero': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'hero-mobile': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '0' }],
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'card-hover': 'cardHover 0.3s ease-out',
        'parallax-slow': 'parallaxSlow 20s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 197, 94, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        cardHover: {
          '0%': { transform: 'scale(1) translateY(0)' },
          '100%': { transform: 'scale(1.05) translateY(-8px)' },
        },
        parallaxSlow: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'gradient-cinematic': 'linear-gradient(135deg, #0F0F23 0%, #1A1040 50%, #0F0F23 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-card': 'linear-gradient(180deg, transparent 0%, rgba(15, 15, 35, 0.8) 100%)',
        'gradient-hero': 'linear-gradient(to right, rgba(15, 15, 35, 0.95) 0%, rgba(15, 15, 35, 0.6) 40%, rgba(15, 15, 35, 0.2) 70%, transparent 100%)',
        'gradient-hero-bottom': 'linear-gradient(to top, #0F0F23 0%, rgba(15, 15, 35, 0.8) 30%, transparent 60%)',
        'gradient-skeleton': 'linear-gradient(90deg, #1A1A3E 25%, #232350 50%, #1A1A3E 75%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.5)',
        'brand-glow': '0 0 30px rgba(34, 197, 94, 0.4)',
        'brand-glow-lg': '0 0 60px rgba(34, 197, 94, 0.5)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.6)',
        'card-hover-brand': '0 12px 40px rgba(34, 197, 94, 0.3)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'glass': '12px',
        'glass-lg': '20px',
      },
      zIndex: {
        'sticky': '100',
        'card-hover': '300',
        'overlay': '400',
        'modal': '500',
        'toast': '600',
        'tooltip': '700',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
