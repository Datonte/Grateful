import { init, id } from '@instantdb/react';

export type Schema = {
  users: {
    id: string;
    twitterId: string;
    username: string;
    twitterHandle: string;
    walletAddress: string;
    createdAt: number;
  };
  gratitude_posts: {
    id: string;
    userId: string;
    content: string;
    createdAt: number;
    reactions: number;
  };
  distributions: {
    id: string;
    userId: string;
    walletAddress: string;
    amount: number;
    transactionHash: string;
    reason: string;
    createdAt: number;
  };
  fee_tracking: {
    id: string;
    totalGivenOut: number;
    lastDistributionTime: number;
    lastCheckedTransaction: string;
  };
};

const db = init<Schema>({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID || 'd16ae845-f359-4bad-8b78-45da1668a002',
});

export const { useQuery, useAuth } = db;

// Helper function for transactions using Instant DB's builder pattern
// Instant DB requires operations to be created using db.tx.table[id()].update()
export async function transact(operations: any[]) {
  try {
    // Instant DB uses db.tx builder pattern for transactions
    // Format: db.tx.table[id()].update({...})
    // Note: Instant DB uses 'update' for both insert and update operations
    
    const instantOps: any[] = [];
    
    for (const op of operations) {
      if (!op || !op.$) {
        console.warn('Invalid operation:', op);
        continue;
      }
      
      // Generate unique ID for each record
      const recordId = id();
      
      if (op.$ === 'users') {
        // For users, we'll always create a new record
        // If user exists, Instant DB will handle it based on unique constraints
        instantOps.push(
          (db as any).tx.users[recordId].update(op.data)
        );
      } else if (op.$ === 'gratitude_posts') {
        // Insert new post
        instantOps.push(
          (db as any).tx.gratitude_posts[recordId].update(op.data)
        );
      } else {
        // Generic operation
        instantOps.push(
          (db as any).tx[op.$][recordId].update(op.data)
        );
      }
    }
    
    // Ensure we have operations to execute
    if (instantOps.length === 0) {
      throw new Error('No valid operations to execute');
    }
    
    console.log('Executing transact with', instantOps.length, 'operations');
    
    // Call transact with builder pattern operations
    const result = await (db as any).transact(instantOps);
    console.log('Transact completed successfully');
    return result;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

export { db };
export { id };

