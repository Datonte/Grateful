'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse">
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (session) {
    return (
      <motion.button
        onClick={() => signOut()}
        className="px-6 py-3 rounded-full bg-gradient-to-r from-grateful-primary to-grateful-secondary text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-grateful-primary/50 transition-all duration-300 flex items-center gap-2"
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
      className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2"
      whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
      whileTap={{ scale: 0.95 }}
    >
      <Twitter className="w-5 h-5" />
      <span>Connect Twitter</span>
    </motion.button>
  );
}

