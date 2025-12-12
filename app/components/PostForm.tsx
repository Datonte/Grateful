'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { transact } from '@/app/lib/instant';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

const MAX_CHARACTERS = 280;

export function PostForm() {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > MAX_CHARACTERS) return;

    setIsSubmitting(true);
    const userId = (session.user as any).id;
    const twitterHandle = (session.user as any).twitterHandle || session.user.name || 'anonymous';

    try {
      // Use Instant DB transaction
      await transact([
        {
          $: 'users',
          where: { twitterId: userId },
          data: {
            twitterId: userId,
            username: twitterHandle,
            twitterHandle: twitterHandle,
            createdAt: Date.now(),
          },
        },
        {
          $: 'gratitude_posts',
          data: {
            userId: userId,
            content: content.trim(),
            createdAt: Date.now(),
            reactions: 0,
          },
        },
      ]);
      
      setContent('');
    } catch (error) {
      console.error('Error posting:', error);
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
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What are you grateful for today? 💜"
          className="w-full p-4 pr-24 rounded-2xl border-2 border-grateful-primary/30 dark:border-grateful-secondary/30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md resize-none focus:outline-none focus:border-grateful-primary dark:focus:border-grateful-secondary transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400"
          rows={4}
          maxLength={MAX_CHARACTERS}
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
            className="p-2 rounded-full bg-gradient-to-r from-grateful-primary to-grateful-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}

