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

    // Get last checked transaction - get the first (and should be only) fee_tracking record
    const tracking = await db.query({
      fee_tracking: {},
    });

    const trackingRecord = tracking?.fee_tracking?.[0];
    const trackingId = trackingRecord?.id || id(); // Use existing ID or generate new one
    const lastCheckedSig = trackingRecord?.lastCheckedTransaction || null;

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
        const normalizedAddress = user.walletAddress.trim().toLowerCase();
        walletMap.set(normalizedAddress, user);
      }
    });

    console.log(`Monitoring: Found ${walletMap.size} users with wallet addresses`);

    // Get recent transactions from treasury wallet
    // Always check the most recent transactions first, then check older ones if needed
    const treasuryPubkey = new PublicKey(treasuryWallet);
    const signatures = await connection.getSignaturesForAddress(treasuryPubkey, {
      limit: 100,
      // Don't use 'before' if we want to check the most recent transactions
      // Only use 'before' if we're doing a backfill
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
        
        // Get account keys - handle both legacy and versioned transactions
        let accountKeys: PublicKey[] = [];
        if ('getAccountKeys' in tx.transaction.message) {
          // Versioned transaction
          accountKeys = tx.transaction.message.getAccountKeys().staticAccountKeys;
        } else {
          // Legacy transaction
          accountKeys = (tx.transaction.message as any).accountKeys || [];
        }

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
          // Account for transaction fees - the actual sent amount might be less
          const transactionFee = tx.meta.fee || 0;
          const amountSOL = (balanceChange - transactionFee) / 1_000_000_000; // Convert lamports to SOL

          // Find recipient - check all accounts except treasury
          for (let i = 0; i < accountKeys.length; i++) {
            if (i === treasuryIndex) continue;

            const recipientAddress = accountKeys[i].toString().trim().toLowerCase();
            const user = walletMap.get(recipientAddress);

            if (user) {
              console.log(`Found match! Transaction ${sigInfo.signature} to ${recipientAddress} (user: ${user.twitterHandle})`);
              
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

                console.log(`Recorded distribution: ${amountSOL} SOL to ${user.twitterHandle}`);
                newDistributions++;
                totalAmount += amountSOL;
              } else {
                console.log(`Distribution already exists for transaction ${sigInfo.signature}`);
              }
            }
          }
          
          // Debug: log if we found outgoing transaction but no user match
          if (newDistributions === 0 && amountSOL > 0.001) {
            console.log(`Outgoing transaction ${sigInfo.signature}: ${amountSOL} SOL, but no registered user found as recipient`);
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
    const currentTotal = trackingRecord?.totalGivenOut || 0;
    const newTotal = currentTotal + totalAmount;

    const lastSig = latestSig || signatures[0]?.signature || lastCheckedSig;

    await db.transact([
      db.tx.fee_tracking[trackingId].update({
        totalGivenOut: newTotal,
        lastDistributionTime: Date.now(),
        lastCheckedTransaction: lastSig || '',
      }),
    ]);

    // Find the most recent signature to track
    const mostRecentSig = signatures.length > 0 ? signatures[0].signature : lastCheckedSig;

    return NextResponse.json({
      success: true,
      newDistributions,
      totalGivenOut: newTotal,
      amountAdded: totalAmount,
      checkedTransactions: signatures.length,
      registeredWallets: walletMap.size,
      mostRecentSignature: mostRecentSig,
      lastCheckedBefore: lastCheckedSig,
    });
  } catch (error: any) {
    console.error('Error monitoring distributions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to monitor distributions' },
      { status: 500 }
    );
  }
}

