'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMovie } from '../../../hooks/useMovie';
import { useWatchProgressStore } from '../../../stores';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Film, Subtitles, Settings, Pipette, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;
  const { movie, loading, error } = useMovie(movieId);
  const { updateProgress, getProgress } = useWatchProgressStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [subtitles, setSubtitles] = useState<{language: string, url: string, format: string}[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout>();
  
  const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    if (!movie || !videoRef.current) return;

    const video = videoRef.current;
    const savedProgress = getProgress(movieId);
    
    if (savedProgress && savedProgress.currentTime > 30) {
      video.currentTime = savedProgress.currentTime;
    }

    const handleTimeUpdate = () => {
      if (video.duration) {
        updateProgress(movieId, Math.floor(video.currentTime), Math.floor(video.duration));
      }
    };

    const handleFullscreenChange = () => {
      setShowControls(!!document.fullscreenElement);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [movie, movieId, getProgress, updateProgress]);

  // Fetch subtitles
  useEffect(() => {
    if (!movie) return;
    
    fetch(`/api/v1/subtitles/${movieId}`)
      .then(res => res.json())
      .then(data => {
        if (data.subtitles) {
          setSubtitles(data.subtitles);
        }
      })
      .catch(() => {});
  }, [movie, movieId]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP failed:', error);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying && !document.fullscreenElement) return;
      setShowControls(!!document.fullscreenElement);
    }, 3000);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!videoRef.current) return;
    
    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowRight':
        e.preventDefault();
        skipForward();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        skipBackward();
        break;
      case 'ArrowUp':
        e.preventDefault();
        videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMute();
        break;
      case '0':
        e.preventDefault();
        videoRef.current.currentTime = 0;
        break;
      case '1':
        e.preventDefault();
        videoRef.current.volume = 0.1;
        break;
      case '2':
        e.preventDefault();
        videoRef.current.volume = 0.2;
        break;
      case '3':
        e.preventDefault();
        videoRef.current.volume = 0.3;
        break;
      case '4':
        e.preventDefault();
        videoRef.current.volume = 0.4;
        break;
      case '5':
        e.preventDefault();
        videoRef.current.volume = 0.5;
        break;
      case '6':
        e.preventDefault();
        videoRef.current.volume = 0.6;
        break;
      case '7':
        e.preventDefault();
        videoRef.current.volume = 0.7;
        break;
      case '8':
        e.preventDefault();
        videoRef.current.volume = 0.8;
        break;
case '9':
         e.preventDefault();
         videoRef.current.volume = 0.9;
         break;
        case 's':
        case 'S':
          e.preventDefault();
          setShowSettings(prev => !prev);
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePiP();
          break;
     }
   };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading player...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
            <Film className="w-10 h-10 text-text-muted" />
          </div>
          <h1 className="text-2xl font-display text-text-primary mb-2">Movie Not Found</h1>
          <p className="text-text-muted mb-6 max-w-md">
            {error || 'The movie you are looking for does not exist or is unavailable.'}
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-bg-primary font-semibold rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-20 left-4 z-20 glass px-3 py-2 rounded-lg text-xs text-text-secondary opacity-70 hover:opacity-100 transition-opacity">
        <span className="font-medium">Keyboard:</span> Space • ← → • ↑ ↓ • F • M • S • P
      </div>
      
      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white hover:text-brand transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        <h2 className="text-xl font-semibold text-white text-center flex-1 mx-4 line-clamp-1">{movie.title}</h2>
      </header>

      <div 
        className="relative h-screen flex items-center justify-center"
        onMouseMove={handleMouseMove}
      >
        <video
          ref={videoRef}
          className="w-full max-w-6xl"
          controls={showControls}
          preload="auto"
          onClick={togglePlay}
        >
          <source src={`/api/v1/stream/${movieId}`} type="video/x-matroska" />
          <source src={`/api/v1/stream/${movieId}`} type="video/mp4" />
          {subtitles.map((sub, index) => (
            <track
              key={index}
              kind="subtitles"
              src={sub.url}
              srcLang={sub.language.substring(0, 2).toLowerCase()}
              label={sub.language}
              default={index === 0}
            />
          ))}
          Your browser does not support the video tag.
        </video>
        
        {/* Custom Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-center gap-4">
            <button onClick={skipBackward} className="p-2 text-white hover:text-brand transition-colors" title="Rewind 10s">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={togglePlay} className="p-3 bg-brand hover:bg-brand-hover rounded-full text-white transition-colors" title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button onClick={skipForward} className="p-2 text-white hover:text-brand transition-colors" title="Skip 10s">
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="p-2 text-white hover:text-brand transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-12 right-0 bg-bg-secondary rounded-lg p-3 shadow-lg min-w-40"
                >
                  <p className="text-xs text-text-secondary mb-2">Playback Speed</p>
                  <div className="flex flex-col gap-1">
                    {SPEED_OPTIONS.map(speed => (
                      <button
                        key={speed}
                        onClick={() => changePlaybackSpeed(speed)}
                        className={`text-left px-2 py-1 text-sm rounded hover:bg-bg-tertiary transition-colors ${playbackSpeed === speed ? 'text-brand font-medium' : 'text-text-primary'}`}
                      >
                        {speed}x {speed === 1 && '(Normal)'}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            
            <button onClick={togglePiP} className="p-2 text-white hover:text-brand transition-colors" title="Picture-in-Picture">
              <Pipette className="w-5 h-5" />
            </button>
            <button onClick={toggleMute} className="p-2 text-white hover:text-brand transition-colors" title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button onClick={toggleFullscreen} className="p-2 text-white hover:text-brand transition-colors" title="Fullscreen">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
