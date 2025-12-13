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
      fee_tracking: {},
      distributions: {},
    });

    const feeData = data?.fee_tracking?.[0] || data?.fee_tracking?.[0];
    const distributions = data?.distributions || [];

    const totalGivenOut = feeData?.totalGivenOut ?? 0;
    const distributionsCount = distributions.length ?? 0;

    return NextResponse.json({
      totalGivenOut,
      distributionsCount,
      lastDistributionTime: feeData?.lastDistributionTime || null,
    });
  } catch (error: any) {
    console.error('Error fetching fee tracking:', error);
    // Return default values instead of error to ensure UI always shows something
    return NextResponse.json({
      totalGivenOut: 0,
      distributionsCount: 0,
      lastDistributionTime: null,
    });
  }
}

