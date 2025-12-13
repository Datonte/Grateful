'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Twitter, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthButton() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'Configuration' || errorParam === 'AccessDenied') {
        setError('Twitter authentication failed. Please check your settings and try again.');
      } else if (errorParam === 'RateLimitExceeded') {
        setError('Too many requests. Please wait a few minutes and try again.');
      } else {
        setError('Authentication error. Please try again.');
      }
      // Clear error after 10 seconds
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/80 backdrop-blur-md animate-pulse border border-slate-300/50">
        <span className="text-xs sm:text-sm text-slate-700">Loading...</span>
      </div>
    );
  }

  if (session) {
    return (
      <motion.button
        onClick={() => signOut()}
        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-grateful-primary to-grateful-secondary text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-grateful-primary/50 transition-all duration-300 flex items-center gap-2 touch-manipulation"
        whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Logout</span>
      </motion.button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <motion.button
        onClick={() => {
          setError(null);
          signIn('twitter', { callbackUrl: window.location.href });
        }}
        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 touch-manipulation"
        whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
        whileTap={{ scale: 0.95 }}
      >
        <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Connect Twitter</span>
      </motion.button>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100/90 backdrop-blur-sm border border-red-300/50 text-red-700 text-xs max-w-xs"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}

