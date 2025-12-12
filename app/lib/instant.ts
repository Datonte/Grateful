import { init } from '@instantdb/react';

export type Schema = {
  users: {
    id: string;
    twitterId: string;
    username: string;
    twitterHandle: string;
    createdAt: number;
  };
  gratitude_posts: {
    id: string;
    userId: string;
    content: string;
    createdAt: number;
    reactions: number;
  };
};

const db = init<Schema>({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID || 'd16ae845-f359-4bad-8b78-45da1668a002',
});

export const { useQuery, useAuth } = db;

// Helper function for transactions using Instant DB's tx API
export async function transact(operations: any[]) {
  try {
    // Instant DB uses tx() for transactions
    const tx = (db as any).tx();
    
    for (const op of operations) {
      if (op.$ === 'users' && op.where) {
        // Upsert user: update if exists, insert if not
        tx.upsert('users', {
          where: op.where,
          data: op.data,
        });
      } else if (op.$ === 'gratitude_posts') {
        // Insert new post
        tx.insert('gratitude_posts', op.data);
      }
    }
    
    // Commit the transaction
    await tx.commit();
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

export { db };

