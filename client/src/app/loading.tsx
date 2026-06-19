'use client';

export default function Loading() {
  return (
    <div className="min-h-screen bg-cinematic-dark">
      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 h-16 glass-strong z-sticky">
        <div className="max-w-[1400px] mx-auto h-full px-4 md:px-8 flex items-center justify-between">
          <div className="w-36 h-7 bg-bg-surface rounded-lg skeleton" />
          <div className="hidden md:flex items-center gap-8">
            <div className="w-16 h-4 bg-bg-surface rounded-lg skeleton" />
            <div className="w-16 h-4 bg-bg-surface rounded-lg skeleton" />
            <div className="w-16 h-4 bg-bg-surface rounded-lg skeleton" />
          </div>
          <div className="w-56 h-10 bg-bg-surface rounded-xl skeleton" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="h-[60vh] md:h-[70vh] lg:h-[85vh] bg-bg-surface relative">
        <div className="absolute inset-0 skeleton" />
        <div className="absolute inset-0 hero-gradient-bottom" />
        <div className="absolute inset-0 hero-gradient-left" />
        
        {/* Hero content skeleton */}
        <div className="absolute inset-0 flex items-end pb-24 md:pb-32">
          <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8">
            <div className="max-w-xl space-y-4">
              <div className="w-24 h-6 bg-bg-surface/50 rounded-full skeleton" />
              <div className="w-3/4 h-12 bg-bg-surface/50 rounded-xl skeleton" />
              <div className="flex gap-3">
                <div className="w-20 h-6 bg-bg-surface/50 rounded-lg skeleton" />
                <div className="w-16 h-6 bg-bg-surface/50 rounded-lg skeleton" />
                <div className="w-24 h-6 bg-bg-surface/50 rounded-lg skeleton" />
              </div>
              <div className="w-full h-20 bg-bg-surface/50 rounded-xl skeleton" />
              <div className="flex gap-3">
                <div className="w-36 h-12 bg-bg-surface/50 rounded-xl skeleton" />
                <div className="w-36 h-12 bg-bg-surface/50 rounded-xl skeleton" />
                <div className="w-12 h-12 bg-bg-surface/50 rounded-xl skeleton" />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicators skeleton */}
        <div className="absolute bottom-8 left-4 md:left-8 flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-2 rounded-full bg-white/20 ${i === 0 ? 'w-8' : 'w-2'}`} />
          ))}
        </div>
      </div>

      {/* Row skeletons */}
      <div className="relative z-10 -mt-16 md:-mt-24 py-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="py-6">
            <div className="px-4 md:px-8 mb-4">
              <div className="w-48 h-7 bg-bg-surface rounded-lg skeleton" />
            </div>
            <div className="flex gap-3 md:gap-4 px-4 md:px-8 overflow-hidden">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                  <div className="aspect-[2/3] bg-bg-surface rounded-xl skeleton" />
                  <div className="mt-3 px-1 space-y-2">
                    <div className="w-3/4 h-4 bg-bg-surface rounded-lg skeleton" />
                    <div className="w-1/2 h-3 bg-bg-surface rounded-lg skeleton" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
