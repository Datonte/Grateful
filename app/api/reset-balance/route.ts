import { NextRequest, NextResponse } from 'next/server';
import { init, id } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

// Endpoint to reset the balance
export async function POST(request: NextRequest) {
  try {
    // Get existing fee_tracking record
    const tracking = await db.query({
      fee_tracking: {},
    });

    const trackingRecord = tracking?.fee_tracking?.[0];
    const trackingId = trackingRecord?.id || id();

    // Reset totalGivenOut to 0
    await db.transact([
      db.tx.fee_tracking[trackingId].update({
        totalGivenOut: 0,
        lastDistributionTime: Date.now(),
        lastCheckedTransaction: '',
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Balance reset successfully',
      totalGivenOut: 0,
    });
  } catch (error: any) {
    console.error('Error resetting balance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset balance' },
      { status: 500 }
    );
  }
}

