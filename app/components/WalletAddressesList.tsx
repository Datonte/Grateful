'use client';

import { useQuery } from '@/app/lib/instant';
import { Copy, Check, Wallet } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function WalletAddressesList() {
  const { data, isLoading } = useQuery({
    users: {
      $: {
        where: {},
      },
    },
  });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const users = data?.users || [];
  // Filter users with non-empty wallet addresses
  const usersWithWallets = users.filter((user: any) => user.walletAddress && user.walletAddress.trim() !== '');

  const handleCopy = (address: string, index: number) => {
    navigator.clipboard.writeText(address);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-grateful-primary/10 to-grateful-secondary/10 border border-grateful-primary/20 animate-pulse mb-8">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (usersWithWallets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-grateful-primary/10 to-grateful-accent/10 dark:from-grateful-primary/15 dark:to-grateful-accent/15 border border-grateful-primary/20 dark:border-grateful-accent/30 backdrop-blur-sm mb-6 sm:mb-8 shadow-lg bg-white/80 dark:bg-slate-900/90"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 rounded-lg bg-grateful-primary/20">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-grateful-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 drop-shadow-sm">
            Submitted Wallet Addresses
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          No wallet addresses submitted yet.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50/60 to-sky-50/60 dark:from-blue-950/60 dark:to-indigo-950/60 border border-blue-200/30 dark:border-blue-700/30 backdrop-blur-xl mb-6 sm:mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 dark:bg-slate-900/95"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 rounded-lg bg-grateful-primary/20">
          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-grateful-primary" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 drop-shadow-sm">
          Submitted Wallet Addresses ({usersWithWallets.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
        {usersWithWallets.map((user: any, index: number) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/90 dark:bg-slate-800/90 border border-blue-200/20 dark:border-blue-700/30 flex items-center justify-between gap-2 sm:gap-3 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-md hover:shadow-lg backdrop-blur-sm"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  @{user.twitterHandle || user.username || 'anonymous'}
                </span>
              </div>
              <p className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 break-all drop-shadow-sm">
                {user.walletAddress}
              </p>
            </div>
            <motion.button
              onClick={() => handleCopy(user.walletAddress, index)}
              className="p-1.5 sm:p-2 rounded-lg bg-white/95 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-600 transition-colors flex-shrink-0 shadow-sm hover:shadow-md touch-manipulation"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Copy address"
            >
              {copiedIndex === index ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-400" />
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-grateful-primary/20">
        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 text-center px-2">
          Click the copy icon to copy each wallet address
        </p>
      </div>
    </motion.div>
  );
}

