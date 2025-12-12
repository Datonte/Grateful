'use client';

import { useQuery } from '@/app/lib/instant';
import { GratitudePost } from './GratitudePost';
import { motion } from 'framer-motion';

export function GratitudeFeed() {
  const { data, isLoading } = useQuery({
    gratitude_posts: {
      $: {
        where: {},
      },
    },
    users: {},
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const posts = data?.gratitude_posts || [];
  const users = data?.users || [];

  // Map users by id and twitterId for easy lookup
  const usersMap = new Map();
  users.forEach((user: any) => {
    usersMap.set(user.id, user);
    usersMap.set(user.twitterId, user);
  });

  // Enrich posts with user data and sort by createdAt (newest first), limit to 50
  const enrichedPosts = posts
    .map((post: any) => {
      const user = usersMap.get(post.userId) || null;
      return {
        ...post,
        user,
      };
    })
    .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 50);

  if (enrichedPosts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        <p className="text-lg">No posts yet. Be the first to share your gratitude! 💜</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {enrichedPosts.map((post: any, index: number) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GratitudePost post={post} />
        </motion.div>
      ))}
    </div>
  );
}

