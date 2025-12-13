import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { init, id } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

// Use Ankr's fast public RPC (free, no API key needed)
// Fallback to public RPC if custom one is provided
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://rpc.ankr.com/solana',
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

    // Get all users with wallet addresses (submitted on the website)
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

    console.log(`Monitoring: Found ${walletMap.size} users with wallet addresses submitted on website`);

    // ONLY get transactions FROM treasury wallet (outgoing)
    // We only track transactions FROM treasury TO registered wallets
    const treasuryPubkey = new PublicKey(treasuryWallet);
    
    // Get transactions from treasury wallet (outgoing)
    const treasurySignatures = await connection.getSignaturesForAddress(treasuryPubkey, {
      limit: 100,
    });
    
    // Convert to array and sort by blockTime (most recent first)
    const signatures = treasurySignatures.sort((a, b) => {
      const timeA = a.blockTime || 0;
      const timeB = b.blockTime || 0;
      return timeB - timeA;
    }).slice(0, 100); // Limit to 100 most recent

    let newDistributions = 0;
    let totalAmount = 0;
    let latestSig = lastCheckedSig;

    // Process each transaction FROM treasury wallet
    for (const sigInfo of signatures) {
      try {
        const tx = await connection.getTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx || !tx.meta) continue;

        // Check if this is an outgoing SOL transfer FROM treasury
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

        // Find treasury wallet index
        const treasuryIndex = accountKeys.findIndex(
          (key) => key.toString() === treasuryWallet
        );
        
        if (treasuryIndex === -1) continue; // Skip if treasury not in this transaction

        // Check if treasury sent SOL (outgoing)
        const treasuryBalanceChange = preBalances[treasuryIndex] - postBalances[treasuryIndex];
        if (treasuryBalanceChange <= 0) continue; // Treasury didn't send, skip

        // Find which registered wallet (submitted on website) received it
        let recipientAddress = '';
        let recipientIndex = -1;
        let amountSOL = 0;
        let targetUser = null;

        for (let i = 0; i < accountKeys.length; i++) {
          if (i === treasuryIndex) continue;
          
          const accountBalanceChange = postBalances[i] - preBalances[i];
          
          // If this account's balance increased, check if it's a registered wallet
          if (accountBalanceChange > 0) {
            const checkAddress = accountKeys[i].toString().trim().toLowerCase();
            const checkUser = walletMap.get(checkAddress);
            
            if (checkUser) {
              // Found a wallet address that was submitted on the website!
              recipientAddress = checkAddress;
              recipientIndex = i;
              const transactionFee = tx.meta.fee || 0;
              amountSOL = (treasuryBalanceChange - transactionFee) / 1_000_000_000;
              targetUser = checkUser;
              break; // Found recipient, no need to check others
            }
          }
        }

        // ONLY record if we found a registered wallet recipient (submitted on website)
        if (targetUser && recipientAddress && amountSOL > 0) {
          console.log(`Found match! Transaction ${sigInfo.signature} from treasury to ${recipientAddress} (user: ${targetUser.twitterHandle})`);
          
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
                userId: targetUser.twitterId,
                walletAddress: recipientAddress,
                amount: amountSOL,
                transactionHash: sigInfo.signature,
                reason: 'Community reward',
                createdAt: sigInfo.blockTime
                  ? sigInfo.blockTime * 1000
                  : Date.now(),
              }),
            ]);

            console.log(`Recorded distribution: ${amountSOL} SOL to ${targetUser.twitterHandle} (${recipientAddress})`);
            newDistributions++;
            totalAmount += amountSOL;
          } else {
            console.log(`Distribution already exists for transaction ${sigInfo.signature}`);
          }

          if (!latestSig) {
            latestSig = sigInfo.signature;
          }
        } else if (treasuryBalanceChange > 0) {
          // Treasury sent to non-registered wallet - don't track, just log for debugging
          const sentAmount = (treasuryBalanceChange / 1_000_000_000).toFixed(4);
          console.log(`Transaction ${sigInfo.signature}: Treasury sent ${sentAmount} SOL but recipient is not a registered wallet address`);
        }
      } catch (txError) {
        console.error(`Error processing transaction ${sigInfo.signature}:`, txError);
        continue;
      }
    }

    // Recalculate total from all distributions to registered wallets (for accuracy)
    // This ensures we only count distributions to wallets submitted on the website
    const allDistributions = await db.query({
      distributions: {},
    });

    let recalculatedTotal = 0;
    const registeredWalletSet = new Set(walletMap.keys());
    (allDistributions?.distributions || []).forEach((dist: any) => {
      if (dist.walletAddress && registeredWalletSet.has(dist.walletAddress.trim().toLowerCase())) {
        recalculatedTotal += dist.amount || 0;
      }
    });

    // Use recalculated total (only includes distributions to registered wallets)
    const newTotal = recalculatedTotal;

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

    // Get first few signature strings for debugging
    const signatureList = signatures.slice(0, 5).map(s => s.signature);

    return NextResponse.json({
      success: true,
      newDistributions,
      totalGivenOut: newTotal,
      amountAdded: totalAmount,
      checkedTransactions: signatures.length,
      registeredWallets: walletMap.size,
      mostRecentSignature: mostRecentSig,
      lastCheckedBefore: lastCheckedSig,
      firstFewSignatures: signatureList,
      registeredWalletAddresses: Array.from(walletMap.keys()),
    });
  } catch (error: any) {
    console.error('Error monitoring distributions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to monitor distributions' },
      { status: 500 }
    );
  }
}

