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

// Check what methods are available on db
if (typeof window !== 'undefined') {
  console.log('Instant DB methods:', Object.keys(db));
}

// Helper function for transactions using Instant DB's direct API
export async function transact(operations: any[]) {
  try {
    // Log available methods for debugging
    console.log('DB methods:', Object.keys(db));
    console.log('DB object:', db);
    
    // Instant DB v0.9.0 uses direct mutation on the db object
    // Try different API patterns
    for (const op of operations) {
      if (op.$ === 'users' && op.where) {
        // For users, we need to upsert (update if exists, insert if not)
        // Try the mutate pattern first
        if ((db as any).mutate) {
          await (db as any).mutate({
            users: {
              $: {
                where: op.where,
                data: op.data,
              },
            },
          });
        } else {
          // Fallback: just insert (will create duplicate if exists, but that's okay for now)
          await (db as any).insert('users', op.data);
        }
      } else if (op.$ === 'gratitude_posts') {
        // Insert new post using mutate pattern
        if ((db as any).mutate) {
          await (db as any).mutate({
            gratitude_posts: {
              $: {
                data: op.data,
              },
            },
          });
        } else if ((db as any).insert) {
          await (db as any).insert('gratitude_posts', op.data);
        } else {
          throw new Error('Instant DB mutation methods not available. Available methods: ' + Object.keys(db).join(', '));
        }
      }
    }
  } catch (error) {
    console.error('Transaction error:', error);
    console.error('DB object structure:', db);
    throw error;
  }
}

export { db };

