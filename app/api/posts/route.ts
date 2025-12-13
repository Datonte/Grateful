import { NextRequest, NextResponse } from 'next/server';
import { init, id } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, twitterHandle, content } = await request.json();
    
    if (!userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUsers = await db.query({
      users: {
        $: {
          where: { twitterId: userId },
        },
      },
    });
    
    const existingUser = existingUsers?.users?.[0];
    // Keep existing wallet address if user has one, otherwise empty string
    const existingWallet = existingUser?.walletAddress || '';
    
    // Generate IDs for new records
    const postId = id();
    const userIdForUser = existingUser?.id || id();
    
    // Create operations using db.tx builder pattern
    const operations = [
      db.tx.users[userIdForUser].update({
        twitterId: userId,
        username: twitterHandle,
        twitterHandle: twitterHandle,
        walletAddress: existingWallet, // Keep existing wallet, don't allow new submissions
        createdAt: existingUser?.createdAt || Date.now(),
      }),
      db.tx.gratitude_posts[postId].update({
        userId: userId,
        content: content.trim(),
        createdAt: Date.now(),
        reactions: 0,
      }),
    ];
    
    await db.transact(operations);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

