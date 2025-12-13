import { NextRequest, NextResponse } from 'next/server';
import { init, id } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, twitterHandle, content, walletAddress } = await request.json();
    
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
    const existingWallet = existingUser?.walletAddress || '';
    const walletToSave = walletAddress?.trim() || '';
    
    // Prevent duplicate wallet submissions
    if (existingWallet && walletToSave) {
      return NextResponse.json(
        { error: 'You have already submitted a wallet address. Each Twitter account can only submit one wallet address.' },
        { status: 400 }
      );
    }
    
    // If user exists and has wallet, don't update wallet
    // If user exists but no wallet, allow wallet submission
    // If user doesn't exist, create new user with wallet (if provided)
    const finalWalletAddress = existingWallet || walletToSave;
    
    // Generate IDs for new records
    const postId = id();
    const userIdForUser = existingUser?.id || id();
    
    // Create operations using db.tx builder pattern
    const operations = [
      db.tx.users[userIdForUser].update({
        twitterId: userId,
        username: twitterHandle,
        twitterHandle: twitterHandle,
        walletAddress: finalWalletAddress,
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

