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
// Note: Instant DB transact() only supports insert operations, not upserts with where clauses
export async function transact(operations: any[]) {
  try {
    // Instant DB v0.9.6 transact() only supports simple insert operations
    // Format: [{ $: 'table', data: {...} }]
    // For upserts, we need to handle them separately or just insert (duplicates handled by DB)
    
    const instantOps: any[] = [];
    
    for (const op of operations) {
      if (!op || !op.$) {
        console.warn('Invalid operation:', op);
        continue;
      }
      
      // Instant DB transact() doesn't support where clauses
      // For users with where clause, we'll just insert (DB will handle duplicates if unique constraint exists)
      // Or we can handle it separately
      if (op.$ === 'users') {
        // Just insert - if user exists, it will be a duplicate (handled by DB or we ignore)
        instantOps.push({
          $: 'users',
          data: op.data,
        });
      } else if (op.$ === 'gratitude_posts') {
        // Insert new post
        instantOps.push({
          $: 'gratitude_posts',
          data: op.data,
        });
      } else {
        // Generic insert operation
        instantOps.push({
          $: op.$,
          data: op.data,
        });
      }
    }
    
    // Ensure we have operations to execute
    if (instantOps.length === 0) {
      throw new Error('No valid operations to execute');
    }
    
    console.log('Executing transact with operations:', JSON.stringify(instantOps, null, 2));
    
    // Call transact with the properly formatted operations (inserts only)
    const result = await (db as any).transact(instantOps);
    console.log('Transact result:', result);
    return result;
  } catch (error) {
    console.error('Transaction error:', error);
    console.error('Operations attempted:', JSON.stringify(operations, null, 2));
    throw error;
  }
}

export { db };

