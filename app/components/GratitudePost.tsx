'use client';

import { formatRelativeTime } from '@/app/lib/utils';
import { Heart, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

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
  const [reactionCount, setReactionCount] = useState(post.reactions || 0);
  const [hasReacted, setHasReacted] = useState(false);

  const handleReaction = () => {
    setReactionCount((prev) => (hasReacted ? prev - 1 : prev + 1));
    setHasReacted(!hasReacted);
    // TODO: Update in database
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
      className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 mb-4"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-grateful-primary to-grateful-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {(post.user?.twitterHandle || post.user?.username || 'A').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">
              @{post.user?.twitterHandle || post.user?.username || 'anonymous'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              · {formatRelativeTime(post.createdAt)}
            </span>
          </div>
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
            {post.content}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <motion.button
          onClick={handleReaction}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-grateful-primary dark:hover:text-grateful-accent transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            className={`w-5 h-5 ${hasReacted ? 'fill-current text-grateful-primary' : ''}`}
          />
          <span>{reactionCount}</span>
        </motion.button>
        <motion.button
          onClick={handleShare}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm">Share</span>
        </motion.button>
      </div>
    </motion.article>
  );
}

