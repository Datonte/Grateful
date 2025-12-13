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
      className="text-center mb-8"
    >
      <motion.div
        className="inline-flex items-center gap-2 text-2xl md:text-3xl font-display font-bold text-grateful-primary dark:text-grateful-accent mb-2"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Heart className="w-6 h-6 md:w-8 md:h-8 fill-current text-grateful-primary" />
        </motion.div>
        <span className="glow-text">Welcome @{username}</span>
        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <Heart className="w-6 h-6 md:w-8 md:h-8 fill-current text-grateful-primary" />
        </motion.div>
      </motion.div>
      <p className="text-gray-600 dark:text-gray-300 text-lg">
        Share what you're grateful for in the Solana trenches
      </p>
    </motion.div>
  );
}

