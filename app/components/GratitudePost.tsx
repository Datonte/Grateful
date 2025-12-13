'use client';

import { formatRelativeTime } from '@/app/lib/utils';
import { Heart, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

type Post = {
  id: string;
  userId: string;
  content: string;
  createdAt: number;
  reactions: number;
  user?: {
    username: string;
    twitterHandle: string;
  };
};

export function GratitudePost({ post }: { post: Post }) {
  // Sync reaction count from post prop (which comes from database)
  const [reactionCount, setReactionCount] = useState(post.reactions || 0);
  const [hasReacted, setHasReacted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local state when post prop changes (from database sync)
  useEffect(() => {
    setReactionCount(post.reactions || 0);
  }, [post.reactions]);

  const handleReaction = async () => {
    // Optimistic update
    const newCount = hasReacted ? reactionCount - 1 : reactionCount + 1;
    setReactionCount(newCount);
    setHasReacted(!hasReacted);
    setIsUpdating(true);

    try {
      // Update in database
      const increment = hasReacted ? -1 : 1;
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          increment,
        }),
      });

      if (!response.ok) {
        // Revert on error
        setReactionCount(reactionCount);
        setHasReacted(hasReacted);
        const errorData = await response.json();
        console.error('Failed to update reaction:', errorData.error);
      } else {
        const data = await response.json();
        // Update with server response
        setReactionCount(data.reactions);
      }
    } catch (error) {
      // Revert on error
      setReactionCount(reactionCount);
      setHasReacted(hasReacted);
      console.error('Error updating reaction:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = () => {
    const text = encodeURIComponent(`${post.content} $GRATEFUL`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 sm:p-5 md:p-6 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 mb-4"
    >
      <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-grateful-primary to-grateful-secondary flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
          {(post.user?.twitterHandle || post.user?.username || 'A').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
            <span className="font-semibold text-slate-800 text-sm sm:text-base drop-shadow-sm">
              @{post.user?.twitterHandle || post.user?.username || 'anonymous'}
            </span>
            <span className="text-xs text-slate-600">
              · {formatRelativeTime(post.createdAt)}
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap break-words leading-relaxed drop-shadow-sm">
            {post.content}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 pt-2 sm:pt-3 border-t border-slate-300/50">
        <motion.button
          onClick={handleReaction}
          disabled={isUpdating}
          className="flex items-center gap-1.5 sm:gap-2 text-slate-600 hover:text-grateful-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          whileHover={{ scale: isUpdating ? 1 : 1.1 }}
          whileTap={{ scale: isUpdating ? 1 : 0.9 }}
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 ${hasReacted ? 'fill-current text-grateful-primary' : ''}`}
          />
          <span className="text-sm sm:text-base">{reactionCount}</span>
        </motion.button>
        <motion.button
          onClick={handleShare}
          className="flex items-center gap-1.5 sm:gap-2 text-slate-600 hover:text-blue-500 transition-colors touch-manipulation"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm">Share</span>
        </motion.button>
      </div>
    </motion.article>
  );
}

