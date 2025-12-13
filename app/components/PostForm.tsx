'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@/app/lib/instant';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

const MAX_CHARACTERS = 280;
const PLACEHOLDER_ADDRESS = 'Grateful...ComingSoon...SolanaTrenches';

export function PostForm() {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const userId = session ? (session.user as any).id : null;

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
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post');
      }
      
      console.log('Post submitted successfully');
      setContent('');
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
      className="mb-6 sm:mb-8"
    >
      <div className="space-y-2 sm:space-y-3">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you grateful for today? 💜"
            className="w-full p-3 sm:p-4 pr-16 sm:pr-20 md:pr-24 rounded-xl sm:rounded-2xl border-2 border-blue-300/40 bg-white/95 backdrop-blur-xl resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-sm sm:text-base text-slate-800 placeholder-slate-500 shadow-xl hover:shadow-2xl"
            rows={4}
            maxLength={MAX_CHARACTERS}
            disabled={isSubmitting}
          />
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2 sm:gap-3">
          <span
            className={`text-xs sm:text-sm drop-shadow-sm ${
              remainingChars < 20 ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            {remainingChars}
          </span>
          <motion.button
            type="submit"
            disabled={!content.trim() || isSubmitting || content.length > MAX_CHARACTERS}
            className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-grateful-primary to-grateful-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-grateful-primary/50 transition-all duration-300 animate-glow touch-manipulation"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.9 }}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </motion.button>
        </div>
        </div>
        <div className="space-y-2">
          <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-grateful-primary/10 to-grateful-accent/10 border border-grateful-primary/20 shadow-md">
            <p className="text-xs text-slate-700 mb-1 font-medium drop-shadow-sm">Contract Address</p>
            <p className="font-mono text-[10px] sm:text-xs text-slate-800 break-all drop-shadow-sm">
              {PLACEHOLDER_ADDRESS}
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 rounded-lg bg-red-100 text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}
      
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 rounded-lg bg-green-100 text-green-700 text-sm"
        >
          Post submitted successfully! 💜
        </motion.div>
      )}
    </motion.form>
  );
}

