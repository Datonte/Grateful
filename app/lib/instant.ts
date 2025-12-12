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

// Helper function for transactions
export async function transact(operations: any[]) {
  if (typeof db.transact === 'function') {
    return db.transact(operations);
  } else if (typeof db.tx === 'function') {
    const tx = db.tx();
    operations.forEach((op) => {
      if (op.$ === 'users' && op.where) {
        tx.upsert('users', { where: op.where, data: op.data });
      } else {
        tx.insert(op.$, op.data);
      }
    });
    return await tx.commit();
  } else {
    throw new Error('Instant DB transaction API not available');
  }
}

export { db };

