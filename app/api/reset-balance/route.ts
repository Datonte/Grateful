import { NextRequest, NextResponse } from 'next/server';
import { init, id } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

// Endpoint to reset the balance
export async function POST(request: NextRequest) {
  try {
    const { clearDistributions } = await request.json().catch(() => ({}));

    // Get existing fee_tracking record
    const tracking = await db.query({
      fee_tracking: {},
    });

    const trackingRecord = tracking?.fee_tracking?.[0];
    const trackingId = trackingRecord?.id || id();

    // Get all distributions if we need to clear them
    let distributionsToDelete: string[] = [];
    if (clearDistributions) {
      const distributions = await db.query({
        distributions: {},
      });
      distributionsToDelete = (distributions?.distributions || []).map((d: any) => d.id);
    }

    // Prepare transactions
    const transactions: any[] = [
      db.tx.fee_tracking[trackingId].update({
        totalGivenOut: 0,
        lastDistributionTime: Date.now(),
        lastCheckedTransaction: '',
      }),
    ];

    // Delete all distributions if requested
    if (clearDistributions && distributionsToDelete.length > 0) {
      distributionsToDelete.forEach((distId: string) => {
        transactions.push(db.tx.distributions[distId].delete());
      });
    }

    await db.transact(transactions);

    return NextResponse.json({
      success: true,
      message: clearDistributions 
        ? 'Balance and distributions reset successfully' 
        : 'Balance reset successfully',
      totalGivenOut: 0,
      distributionsCleared: clearDistributions ? distributionsToDelete.length : 0,
    });
  } catch (error: any) {
    console.error('Error resetting balance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset balance' },
      { status: 500 }
    );
  }
}

