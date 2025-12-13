'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 p-2.5 sm:p-3 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 border border-blue-200/30 dark:border-blue-700/50 touch-manipulation"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
      ) : (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
      )}
    </motion.button>
  );
}

