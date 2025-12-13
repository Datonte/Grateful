'use client';

import { useQuery } from '@/app/lib/instant';
import { motion } from 'framer-motion';
import { Gift, TrendingUp } from 'lucide-react';

export function FeeTracker() {
  const { data, isLoading } = useQuery({
    fee_tracking: {
      $: {
        where: {},
      },
    },
    distributions: {
      $: {
        where: {},
      },
    },
    users: {},
  });

  const formatSOL = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-grateful-primary/10 to-grateful-secondary/10 border border-grateful-primary/20 animate-pulse mb-8">
        <div className="h-4 bg-gray-300bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-300bg-gray-600 rounded w-3/4"></div>
      </div>
    );
  }

  const feeData = data?.fee_tracking?.[0];
  const distributions = data?.distributions || [];
  const users = data?.users || [];
  
  // Get set of registered wallet addresses (submitted on website)
  // Filter users with non-empty wallet addresses
  const registeredWallets = new Set<string>();
  users.forEach((user: any) => {
    if (user.walletAddress && user.walletAddress.trim() !== '') {
      registeredWallets.add(user.walletAddress.trim().toLowerCase());
    }
  });
  
  // Only count distributions to registered wallets (submitted on website)
  const registeredDistributions = distributions.filter((dist: any) => {
    if (!dist.walletAddress) return false;
    return registeredWallets.has(dist.walletAddress.trim().toLowerCase());
  });
  
  // Calculate total only from distributions to registered wallets
  const calculatedTotal = registeredDistributions.reduce((sum: number, dist: any) => {
    const amount = dist.amount || 0;
    return sum + amount;
  }, 0);
  
  // Use calculated total (from registered distributions) as primary, fallback to feeData if needed
  const totalGivenOut = calculatedTotal > 0 ? calculatedTotal : (feeData?.totalGivenOut || 0);
  const distributionsCount = registeredDistributions.length;
  
  // Enhanced debug logging
  console.log('=== FeeTracker Debug ===');
  console.log('Registered wallets:', Array.from(registeredWallets));
  console.log('All distributions:', distributions.length);
  console.log('Registered distributions:', registeredDistributions.length);
  console.log('FeeData totalGivenOut:', feeData?.totalGivenOut);
  console.log('Calculated total (registered only):', calculatedTotal);
  console.log('Total given out:', totalGivenOut);
  console.log('======================');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50/60 to-sky-50/60from-blue-950/60to-indigo-950/60 border border-blue-200/30border-blue-700/30 backdrop-blur-xl mb-6 sm:mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95bg-slate-900/95"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 rounded-lg bg-grateful-primary/20">
          <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-grateful-primary" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-800text-slate-100 drop-shadow-sm">
          Community Rewards Given Out
        </h3>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <span className="text-xs sm:text-sm text-slate-700text-slate-300 font-medium drop-shadow-sm">Total Distributed</span>
          <motion.span 
            className="font-bold text-xl sm:text-2xl text-grateful-primary"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {formatSOL(totalGivenOut)} SOL
          </motion.span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 pt-2 border-t border-grateful-primary/20">
          <span className="text-xs sm:text-sm text-slate-600text-slate-400">
            {distributionsCount} distribution
            {distributionsCount !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-600text-slate-400">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Auto-tracked</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

