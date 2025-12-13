'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const PLACEHOLDER_ADDRESS = 'Grateful...ComingSoon...SolanaTrenches';

export function ContractAddress() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PLACEHOLDER_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/95bg-slate-900/95 backdrop-blur-xl bg-gradient-to-r from-blue-50/50 to-sky-50/50from-blue-950/50to-indigo-950/50 border border-blue-200/30border-blue-700/30 shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-slate-700text-slate-300 mb-1 font-medium drop-shadow-sm">Contract Address</p>
          <p className="font-mono text-xs sm:text-sm text-slate-800text-slate-200 truncate drop-shadow-sm">
            {PLACEHOLDER_ADDRESS}
          </p>
        </div>
        <motion.button
          onClick={handleCopy}
          className="p-1.5 sm:p-2 rounded-lg bg-white/90bg-slate-800/90 hover:bg-whitehover:bg-slate-700 transition-colors flex-shrink-0 shadow-sm hover:shadow-md touch-manipulation"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {copied ? (
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600text-slate-400" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

