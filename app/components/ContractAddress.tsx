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
      className="mb-8 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 dark:border-purple-400/20"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contract Address</p>
          <p className="font-mono text-sm text-gray-900 dark:text-gray-100 truncate">
            {PLACEHOLDER_ADDRESS}
          </p>
        </div>
        <motion.button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

