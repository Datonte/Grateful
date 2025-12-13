'use client';

import { Twitter, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export function SocialButtons() {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center px-2">
      <motion.a
        href="https://x.com/i/communities/1999849334133678514"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 touch-manipulation"
        whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
        whileTap={{ scale: 0.95 }}
      >
        <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Join Community</span>
      </motion.a>
      <motion.a
        href="https://dexscreener.com/solana/DBqEjQPsHA8tiQSQkZonu7zm9ax9KzB918wxGBwThXcd"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-grateful-primary to-grateful-secondary text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-grateful-primary/50 transition-all duration-300 touch-manipulation"
        whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
        whileTap={{ scale: 0.95 }}
      >
        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Dexscreener</span>
      </motion.a>
    </div>
  );
}

