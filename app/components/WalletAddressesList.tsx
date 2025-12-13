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
        className="p-6 rounded-2xl bg-gradient-to-br from-grateful-primary/10 to-grateful-accent/10 border border-grateful-primary/20 dark:border-grateful-accent/20 backdrop-blur-sm mb-8 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-grateful-primary/20">
            <Wallet className="w-5 h-5 text-grateful-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Submitted Wallet Addresses
          </h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No wallet addresses submitted yet.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-grateful-primary/10 to-grateful-accent/10 border border-grateful-primary/20 dark:border-grateful-accent/20 backdrop-blur-sm mb-8 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-grateful-primary/20">
          <Wallet className="w-5 h-5 text-grateful-primary" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Submitted Wallet Addresses ({usersWithWallets.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {usersWithWallets.map((user: any, index: number) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 rounded-xl bg-white/60 dark:bg-sky-800/50 border border-grateful-primary/20 flex items-center justify-between gap-3 hover:bg-white/80 dark:hover:bg-sky-700/70 transition-colors shadow-sm hover:shadow-md"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  @{user.twitterHandle || user.username || 'anonymous'}
                </span>
              </div>
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                {user.walletAddress}
              </p>
            </div>
            <motion.button
              onClick={() => handleCopy(user.walletAddress, index)}
              className="p-2 rounded-lg bg-white/90 dark:bg-sky-700/80 hover:bg-white dark:hover:bg-sky-600 transition-colors flex-shrink-0 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Copy address"
            >
              {copiedIndex === index ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-grateful-primary/20">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Click the copy icon to copy each wallet address
        </p>
      </div>
    </motion.div>
  );
}

