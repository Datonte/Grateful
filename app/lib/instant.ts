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
// Instant DB v0.9.6 uses db.transact() for mutations
export async function transact(operations: any[]) {
  try {
    // Check what methods are available (for debugging)
    const dbMethods = Object.keys(db);
    console.log('Available DB methods:', dbMethods);
    
    // Instant DB v0.9.6 pattern: use db.transact() if available
    if (typeof (db as any).transact === 'function') {
      // Convert operations to Instant DB format
      const instantOps = operations.map((op) => {
        if (op.$ === 'users' && op.where) {
          return {
            $: 'users',
            where: op.where,
            data: op.data,
          };
        } else {
          return {
            $: op.$,
            data: op.data,
          };
        }
      });
      
      return await (db as any).transact(instantOps);
    } 
    // Try alternative: direct mutation on db object
    else if (typeof (db as any).mutate === 'function') {
      // Build mutation object
      const mutation: any = {};
      for (const op of operations) {
        if (op.$ === 'users' && op.where) {
          mutation.users = {
            $: {
              where: op.where,
              data: op.data,
            },
          };
        } else {
          mutation[op.$] = {
            $: {
              data: op.data,
            },
          };
        }
      }
      return await (db as any).mutate(mutation);
    }
    // Last resort: try direct insert (will log available methods)
    else {
      console.error('Neither transact() nor mutate() found. Available methods:', dbMethods);
      throw new Error(`Instant DB mutation API not found. Available methods: ${dbMethods.join(', ')}`);
    }
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

export { db };

