import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { init, id } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

// This will be called by a cron job every 5 minutes
export async function GET(request: NextRequest) {
  try {
    const treasuryWallet = process.env.TREASURY_WALLET_ADDRESS;
    if (!treasuryWallet) {
      return NextResponse.json(
        { error: 'Treasury wallet not configured' },
        { status: 400 }
      );
    }

    // Get last checked transaction
    const tracking = await db.query({
      fee_tracking: {
        $: {
          where: { id: 'fee-tracking-1' },
        },
      },
    });

    const lastCheckedSig =
      tracking?.fee_tracking?.[0]?.lastCheckedTransaction || null;

    // Get all users with wallet addresses
    const users = await db.query({
      users: {
        $: {
          where: { walletAddress: { $ne: '' } },
        },
      },
    });

    const walletMap = new Map();
    (users?.users || []).forEach((user: any) => {
      if (user.walletAddress) {
        walletMap.set(user.walletAddress.toLowerCase(), user);
      }
    });

    // Get recent transactions from treasury wallet
    const treasuryPubkey = new PublicKey(treasuryWallet);
    const signatures = await connection.getSignaturesForAddress(treasuryPubkey, {
      limit: 100,
      before: lastCheckedSig || undefined,
    });

    let newDistributions = 0;
    let totalAmount = 0;
    let latestSig = lastCheckedSig;

    // Process each transaction
    for (const sigInfo of signatures) {
      try {
        const tx = await connection.getTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx || !tx.meta) continue;

        // Check if this is an outgoing SOL transfer
        const preBalances = tx.meta.preBalances || [];
        const postBalances = tx.meta.postBalances || [];
        const accountKeys = tx.transaction.message.accountKeys;

        // Find treasury wallet in accounts
        const treasuryIndex = accountKeys.findIndex(
          (key) => key.toString() === treasuryWallet
        );

        if (treasuryIndex === -1) continue;

        // Check if treasury balance decreased (outgoing)
        const balanceChange =
          preBalances[treasuryIndex] - postBalances[treasuryIndex];

        if (balanceChange > 0) {
          // This is an outgoing transaction
          const amountSOL = balanceChange / 1_000_000_000; // Convert lamports to SOL

          // Find recipient
          for (let i = 0; i < accountKeys.length; i++) {
            if (i === treasuryIndex) continue;

            const recipientAddress = accountKeys[i].toString().toLowerCase();
            const user = walletMap.get(recipientAddress);

            if (user) {
              // Check if this distribution already exists
              const existingDist = await db.query({
                distributions: {
                  $: {
                    where: { transactionHash: sigInfo.signature },
                  },
                },
              });

              if (existingDist?.distributions?.length === 0) {
                // This is a distribution to a registered user!
                const distId = id();
                await db.transact([
                  db.tx.distributions[distId].update({
                    userId: user.twitterId,
                    walletAddress: recipientAddress,
                    amount: amountSOL,
                    transactionHash: sigInfo.signature,
                    reason: 'Community reward',
                    createdAt: sigInfo.blockTime
                      ? sigInfo.blockTime * 1000
                      : Date.now(),
                  }),
                ]);

                newDistributions++;
                totalAmount += amountSOL;
              }
            }
          }

          if (!latestSig) {
            latestSig = sigInfo.signature;
          }
        }
      } catch (txError) {
        console.error(`Error processing transaction ${sigInfo.signature}:`, txError);
        continue;
      }
    }

    // Update total and last checked
    const currentTracking = tracking?.fee_tracking?.[0];
    const currentTotal = currentTracking?.totalGivenOut || 0;
    const newTotal = currentTotal + totalAmount;

    const lastSig = latestSig || signatures[0]?.signature || lastCheckedSig;

    await db.transact([
      db.tx.fee_tracking['fee-tracking-1'].update({
        totalGivenOut: newTotal,
        lastDistributionTime: Date.now(),
        lastCheckedTransaction: lastSig || '',
      }),
    ]);

    return NextResponse.json({
      success: true,
      newDistributions,
      totalGivenOut: newTotal,
      amountAdded: totalAmount,
    });
  } catch (error: any) {
    console.error('Error monitoring distributions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to monitor distributions' },
      { status: 500 }
    );
  }
}

