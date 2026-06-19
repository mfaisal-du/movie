'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Film } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cinematic-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-32 h-32 mx-auto mb-8 rounded-full bg-bg-surface flex items-center justify-center"
        >
          <Film className="w-16 h-16 text-brand" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-8xl font-display text-brand mb-4"
        >
          404
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl text-text-secondary mb-8 max-w-md"
        >
          This page doesn&apos;t exist or may have been moved.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand hover:bg-brand-hover text-bg-primary font-bold rounded-xl transition-all duration-300 hover:shadow-brand-glow-lg hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
