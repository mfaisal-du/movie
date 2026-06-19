'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Film, HardDrive, TrendingUp, RefreshCw, Lock, Unlock, Search, Trash2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);

  const handleAuth = async () => {
    if (!password.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/stats?password=${encodeURIComponent(password)}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
        setIsAuthenticated(true);
        toast.success('Authenticated successfully');
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`/api/v1/admin/scan?password=${encodeURIComponent(password)}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        const statsRes = await fetch(`/api/v1/admin/stats?password=${encodeURIComponent(password)}`);
        const statsData = await statsRes.json();
        setStats(statsData.data);
      } else {
        toast.error('Scan failed');
      }
    } catch (error) {
      toast.error('Connection failed');
    } finally {
      setScanning(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`/api/v1/movies/search?q=${encodeURIComponent(searchQuery)}&limit=20&password=${encodeURIComponent(password)}`);
      const data = await res.json();
      setSearchResults(data.data.movies || []);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const toggleFeatured = async (movieId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/featured/${movieId}?password=${encodeURIComponent(password)}`, { method: 'POST' });
      if (res.ok) {
        toast.success('Featured status updated');
        handleSearch();
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const deleteMovie = async (movieId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/movies/${movieId}?password=${encodeURIComponent(password)}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Movie deactivated');
        handleSearch();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cinematic-dark flex items-center justify-center pt-16 md:pt-18">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 max-w-md w-full mx-4"
        >
          <div className="text-center mb-6">
            <Settings className="w-16 h-16 text-brand mx-auto mb-4" />
            <h1 className="text-3xl font-display text-text-primary mb-2">Admin Panel</h1>
            <p className="text-text-muted">Enter password to continue</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            placeholder="Admin Password"
            className="w-full px-4 py-3 glass rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand mb-4"
          />
          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full py-3 bg-brand hover:bg-brand-hover text-bg-primary font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Unlock className="w-5 h-5" />}
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinematic-dark pt-16 md:pt-18">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display text-text-primary">Admin Dashboard</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 glass rounded-lg text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand/20 rounded-lg">
                  <Film className="w-8 h-8 text-brand" />
                </div>
                <div>
                  <p className="text-text-muted text-sm">Total Movies</p>
                  <p className="text-3xl font-bold text-text-primary">{stats.totalMovies}</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand/20 rounded-lg">
                  <HardDrive className="w-8 h-8 text-brand" />
                </div>
                <div>
                  <p className="text-text-muted text-sm">Total Size</p>
                  <p className="text-3xl font-bold text-text-primary">{formatBytes(stats.totalSize)}</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-brand" />
                </div>
                <div>
                  <p className="text-text-muted text-sm">Recent Views (7d)</p>
                  <p className="text-3xl font-bold text-text-primary">{stats.recentViews}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Genre Stats */}
        {stats?.genres && (
          <div className="glass rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Movies by Genre</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.genres.map((g: any) => (
                <div key={g.slug} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-brand/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-brand">{g.count}</span>
                  </div>
                  <p className="text-text-secondary">{g.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scan Button */}
        <div className="glass rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Library Scan</h2>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-6 py-3 bg-brand hover:bg-brand-hover text-bg-primary font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            {scanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            {scanning ? 'Scanning...' : 'Scan Library'}
          </button>
          <p className="text-text-muted text-sm mt-2">Scans WD Cloud for new/updated movies</p>
        </div>

        {/* Movie Search */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Manage Movies</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search movies..."
              className="flex-1 px-4 py-2 glass rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-brand hover:bg-brand-hover text-bg-primary rounded-lg transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence>
              {searchResults.map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between p-3 glass rounded-lg mb-2"
                >
                  <div>
                    <h3 className="text-text-primary font-medium">{movie.title}</h3>
                    <p className="text-text-muted text-sm">{movie.year} • {movie.quality}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFeatured(movie.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        movie.featured ? 'bg-accent-gold/20 text-accent-gold' : 'glass text-text-secondary'
                      }`}
                      title="Toggle Featured"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMovie(movie.id, movie.title)}
                      className="p-2 rounded-lg glass text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Movie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}