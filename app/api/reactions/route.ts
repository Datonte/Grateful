import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { postId, increment } = await request.json();
    
    if (!postId || increment === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get current post to read the current reaction count
    const posts = await db.query({
      gratitude_posts: {
        $: {
          where: { id: postId },
        },
      },
    });
    
    const post = posts?.gratitude_posts?.[0];
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    const currentReactions = post.reactions || 0;
    const newReactions = Math.max(0, currentReactions + increment);
    
    // Update the post with new reaction count
    await db.transact([
      db.tx.gratitude_posts[postId].update({
        reactions: newReactions,
      }),
    ]);
    
    return NextResponse.json({ success: true, reactions: newReactions });
  } catch (error: any) {
    console.error('Error updating reaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update reaction' },
      { status: 500 }
    );
  }
}

