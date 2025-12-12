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
    // Instant DB v0.9.6 transact() expects operations array
    // Each operation should have: { $: 'table', data: {...} } for inserts
    // For upserts: { $: 'table', where: {...}, data: {...} }
    
    const instantOps: any[] = [];
    
    for (const op of operations) {
      if (!op || !op.$) {
        console.warn('Invalid operation:', op);
        continue;
      }
      
      if (op.$ === 'users' && op.where) {
        // Upsert user: update if exists, insert if not
        instantOps.push({
          $: 'users',
          where: op.where,
          data: op.data,
        });
      } else if (op.$ === 'gratitude_posts') {
        // Insert new post
        instantOps.push({
          $: 'gratitude_posts',
          data: op.data,
        });
      } else {
        // Generic operation
        const instantOp: any = {
          $: op.$,
        };
        if (op.where) {
          instantOp.where = op.where;
        }
        if (op.data) {
          instantOp.data = op.data;
        }
        instantOps.push(instantOp);
      }
    }
    
    // Ensure we have operations to execute
    if (instantOps.length === 0) {
      throw new Error('No valid operations to execute');
    }
    
    console.log('Executing transact with operations:', instantOps);
    
    // Call transact with the properly formatted operations
    const result = await (db as any).transact(instantOps);
    console.log('Transact result:', result);
    return result;
  } catch (error) {
    console.error('Transaction error:', error);
    console.error('Operations attempted:', operations);
    throw error;
  }
}

export { db };

