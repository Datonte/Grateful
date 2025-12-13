'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthButton() {
  const { data: session, status } = useSession();

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
    <motion.button
      onClick={() => signIn('twitter')}
      className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 touch-manipulation"
      whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
      whileTap={{ scale: 0.95 }}
    >
      <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
      <span>Connect Twitter</span>
    </motion.button>
  );
}

