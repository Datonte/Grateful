'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@/app/lib/instant';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

const MAX_CHARACTERS = 280;
const PLACEHOLDER_ADDRESS = 'Grateful...ComingSoon...SolanaTrenches';

export function PostForm() {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const userId = session ? (session.user as any).id : null;

  // Check if user already has a wallet address
  const { data: userData } = useQuery({
    users: {
      $: {
        where: userId ? { twitterId: userId } : {},
      },
    },
  });

  const existingUser = userData?.users?.[0];
  const existingWallet = existingUser?.walletAddress || '';

  // Check if user has any posts
  const { data: postsData } = useQuery({
    gratitude_posts: {
      $: {
        where: userId ? { userId: userId } : {},
      },
    },
  });

  const userPosts = postsData?.gratitude_posts || [];
  const hasPosts = userPosts.length > 0;
  const canSubmitWallet = hasPosts || existingWallet; // Can submit if they have posts OR already have a wallet

  // Set existing wallet if found
  useEffect(() => {
    if (existingWallet && !walletAddress) {
      // Don't set it, just keep it disabled
    }
  }, [existingWallet, walletAddress]);

  if (!session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > MAX_CHARACTERS) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    const twitterHandle = (session.user as any).twitterHandle || session.user.name || 'anonymous';

    if (!userId) {
      setError('User ID not found. Please try logging in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Submitting post with userId:', userId, 'twitterHandle:', twitterHandle);
      
      // Only send wallet address if user doesn't already have one
      const walletToSubmit = existingWallet ? '' : walletAddress.trim();
      
      // Call API route to create post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          twitterHandle,
          content: content.trim(),
          walletAddress: walletToSubmit,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post');
      }
      
      console.log('Post submitted successfully');
      setContent('');
      if (!existingWallet) {
        setWalletAddress('');
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error posting:', error);
      setError(error?.message || 'Failed to post. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = MAX_CHARACTERS - content.length;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you grateful for today? 💜"
            className="w-full p-4 pr-24 rounded-2xl border-2 border-grateful-primary/30 dark:border-grateful-primary/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md resize-none focus:outline-none focus:border-grateful-primary dark:focus:border-grateful-accent transition-all duration-300 text-gray-900 dark:text-gray-50 placeholder-gray-500 dark:placeholder-gray-400 shadow-lg hover:shadow-xl"
            rows={4}
            maxLength={MAX_CHARACTERS}
            disabled={isSubmitting}
          />
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span
            className={`text-sm ${
              remainingChars < 20 ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {remainingChars}
          </span>
          <motion.button
            type="submit"
            disabled={!content.trim() || isSubmitting || content.length > MAX_CHARACTERS}
            className="p-2 rounded-full bg-gradient-to-r from-grateful-primary to-grateful-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-grateful-primary/50 transition-all duration-300 animate-glow"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.9 }}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
        </div>
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-gradient-to-r from-grateful-primary/10 to-grateful-accent/10 border border-grateful-primary/20 dark:border-grateful-accent/20 shadow-md">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Contract Address</p>
            <p className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all">
              {PLACEHOLDER_ADDRESS}
            </p>
          </div>
          {existingWallet ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your wallet address (already submitted):
              </p>
              <input
                type="text"
                value={existingWallet}
                readOnly
                className="w-full p-3 rounded-xl border-2 border-grateful-primary/30 dark:border-grateful-primary/40 bg-gray-100 dark:bg-slate-800 backdrop-blur-md text-gray-900 dark:text-gray-50 text-sm font-mono cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You can only submit one wallet address per Twitter account.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={hasPosts ? "Your Solana wallet address (optional, for rewards)" : "Submit a post first to add your wallet address"}
                className={`w-full p-3 rounded-xl border-2 border-grateful-primary/30 dark:border-grateful-primary/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md focus:outline-none focus:border-grateful-primary dark:focus:border-grateful-accent transition-all duration-300 text-gray-900 dark:text-gray-50 placeholder-gray-500 dark:placeholder-gray-400 text-sm shadow-md hover:shadow-lg ${
                  !hasPosts ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting || !hasPosts}
              />
              {!hasPosts && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You need to submit at least one post before you can add your wallet address.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}
      
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm"
        >
          Post submitted successfully! 💜
        </motion.div>
      )}
    </motion.form>
  );
}

