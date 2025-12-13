import { NextResponse } from 'next/server';
import { init } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

// Public endpoint - no auth required
export async function GET() {
  try {
    const data = await db.query({
      fee_tracking: {
        $: {
          where: {},
        },
      },
      distributions: {
        $: {
          where: {},
        },
      },
    });

    const feeData = data?.fee_tracking?.[0];
    const distributions = data?.distributions || [];

    return NextResponse.json({
      totalGivenOut: feeData?.totalGivenOut || 0,
      distributionsCount: distributions.length,
      lastDistributionTime: feeData?.lastDistributionTime || null,
    });
  } catch (error: any) {
    console.error('Error fetching fee tracking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch fee tracking' },
      { status: 500 }
    );
  }
}

