'use client';

import { useState } from 'react';
import KDSLogo3D from './KDSLogo3D';

/**
 * KDSAuth — Account creation & login
 * Beautiful auth flow with 3D logo
 */

interface AuthProps {
  onLogin: (user: { email: string; name: string }) => void;
}

export default function KDSAuth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (mode === 'signup') {
        // Send welcome email (simulated)
        console.log(`📧 Sending welcome email to ${email}`);
        setSuccess(true);
        
        // Auto-login after 2 seconds
        setTimeout(() => {
          onLogin({ email, name: name || email.split('@')[0] });
        }, 2000);
      } else {
        onLogin({ email, name: email.split('@')[0] });
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-8">
            <KDSLogo3D size={120} />
          </div>
          <h2 className="text-3xl font-bold mb-4 glow-lime">Welcome to the Future!</h2>
          <p className="text-gray-400 text-lg mb-2">Account created successfully.</p>
          <p className="text-gray-500 text-sm">Check your email for a welcome message.</p>
          <div className="mt-8">
            <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <KDSLogo3D size={150} />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="glow-lime">KINGS DRIPPING SWAG</span>
          </h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">2130 • The Future Is Now</p>
        </div>

        {/* Auth Form */}
        <div className="glass rounded-3xl p-8 border border-white/10">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-lime text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-lime text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-lime/30 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-lime/30 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-lime/30 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-lime text-black font-bold text-lg hover:shadow-2xl hover:shadow-lime/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{mode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                <span>{mode === 'signup' ? 'Enter 2130 →' : 'Welcome Back →'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            By {mode === 'signup' ? 'creating an account' : 'signing in'}, you agree to our Terms of Service.
          </div>
        </div>
      </div>
    </div>
  );
}
