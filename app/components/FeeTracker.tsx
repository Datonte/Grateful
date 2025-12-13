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
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
    );
  }

  const feeData = data?.fee_tracking?.[0];
  const distributions = data?.distributions || [];
  
  // Debug logging - check what's actually in feeData
  console.log('FeeTracker full data:', data);
  console.log('FeeTracker feeData:', feeData);
  console.log('FeeTracker feeData keys:', feeData ? Object.keys(feeData) : 'no feeData');
  console.log('FeeTracker distributions:', distributions);
  
  // Try to get totalGivenOut - check multiple possible field names
  const totalGivenOut = feeData?.totalGivenOut ?? feeData?.total_given_out ?? 0;
  const distributionsCount = distributions.length;
  
  // Calculate from distributions if totalGivenOut is 0
  const calculatedTotal = distributions.reduce((sum: number, dist: any) => sum + (dist.amount || 0), 0);
  const displayTotal = totalGivenOut > 0 ? totalGivenOut : calculatedTotal;
  
  console.log('FeeTracker totals:', { totalGivenOut, calculatedTotal, displayTotal });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-grateful-primary/10 to-grateful-secondary/10 border border-grateful-primary/20 backdrop-blur-sm mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-grateful-primary/20">
          <Gift className="w-5 h-5 text-grateful-primary" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Community Rewards Given Out
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Total Distributed</span>
          <span className="font-bold text-2xl text-grateful-accent">
            {formatSOL(displayTotal)} SOL
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-grateful-primary/20">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {distributionsCount} distribution
            {distributionsCount !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>Auto-tracked</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

