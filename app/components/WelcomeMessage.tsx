'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export function WelcomeMessage() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const username = (session.user as any).twitterHandle || session.user.name || 'friend';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6 sm:mb-8"
    >
      <motion.div
        className="inline-flex items-center gap-1.5 sm:gap-2 text-xl sm:text-2xl md:text-3xl font-display font-bold text-grateful-primary mb-2"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 fill-current text-grateful-primary" />
        </motion.div>
        <span className="px-1">Welcome @{username}</span>
        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 fill-current text-grateful-primary" />
        </motion.div>
      </motion.div>
      <p className="text-slate-700 text-sm sm:text-base md:text-lg font-medium drop-shadow-sm px-2">
        Share what you're grateful for in the Solana trenches
      </p>
    </motion.div>
  );
}

