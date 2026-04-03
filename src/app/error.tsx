'use client';

import Link from 'next/link';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorBoundaryProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-lime rounded-full blur-[300px] opacity-[0.05]" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-red-500 rounded-full blur-[250px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="glass rounded-3xl p-8 border border-white/[0.06] text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl mx-auto mb-6">
            ⚠️
          </div>

          {/* Heading */}
          <h1 className="font-display font-black text-3xl mb-4">
            Something went wrong
          </h1>

          {/* Error Message */}
          <div className="mb-6">
            <p className="text-text-secondary text-sm leading-relaxed">
              {isDevelopment ? error.message : (error.digest || 'An unexpected error occurred')}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="group relative px-6 py-3 rounded-full bg-lime text-void font-display font-bold hover:shadow-2xl hover:shadow-lime/30 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Try Again</span>
              <div className="absolute inset-0 rounded-full bg-lime opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
            </button>

            <Link
              href="/"
              className="px-6 py-3 rounded-full border border-white/10 hover:border-white/20 text-text-secondary hover:text-white transition-all duration-300 hover:bg-white/5"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}