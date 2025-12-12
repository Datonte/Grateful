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
  if (typeof (db as any).transact === 'function') {
    return (db as any).transact(operations);
  } else if (typeof (db as any).tx === 'function') {
    const tx = (db as any).tx();
    operations.forEach((op: any) => {
      if (op.$ === 'users' && op.where) {
        tx.upsert('users', { where: op.where, data: op.data });
      } else {
        tx.insert(op.$, op.data);
      }
    });
    return await tx.commit();
  } else {
    // Fallback: try direct insert/update methods
    operations.forEach(async (op: any) => {
      if (op.$ === 'users' && op.where) {
        // Try to find existing user first
        const existing = await (db as any).query('users', { where: op.where });
        if (existing && existing.length > 0) {
          await (db as any).update('users', { where: op.where, data: op.data });
        } else {
          await (db as any).insert('users', op.data);
        }
      } else {
        await (db as any).insert(op.$, op.data);
      }
    });
  }
}

export { db };

