'use client';

import { Twitter, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export function SocialButtons() {
  return (
    <div className="flex items-center gap-4 mb-8 justify-center">
      <motion.a
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Twitter className="w-5 h-5" />
        <span>Twitter</span>
      </motion.a>
      <motion.a
        href="https://dexscreener.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ExternalLink className="w-5 h-5" />
        <span>Dexscreener</span>
      </motion.a>
    </div>
  );
}

