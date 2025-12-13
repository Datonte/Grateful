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

    // Get recent transactions from treasury wallet AND check all registered wallets for incoming transactions
    // This way we catch transactions sent from any source (Binance, etc.) to registered wallets
    const treasuryPubkey = new PublicKey(treasuryWallet);
    
    // Get transactions from treasury wallet (outgoing)
    const treasurySignatures = await connection.getSignaturesForAddress(treasuryPubkey, {
      limit: 100,
    });
    
    // Also get transactions TO all registered wallets (incoming from any source)
    const allSignatures = new Map<string, any>();
    treasurySignatures.forEach(sig => {
      allSignatures.set(sig.signature, sig);
    });
    
    // Get transactions for each registered wallet
    for (const [walletAddr, user] of walletMap.entries()) {
      try {
        const walletPubkey = new PublicKey(walletAddr);
        const walletSigs = await connection.getSignaturesForAddress(walletPubkey, {
          limit: 50, // Check recent 50 for each wallet
        });
        walletSigs.forEach(sig => {
          if (!allSignatures.has(sig.signature)) {
            allSignatures.set(sig.signature, { ...sig, targetWallet: walletAddr });
          }
        });
      } catch (error) {
        console.error(`Error fetching transactions for wallet ${walletAddr}:`, error);
      }
    }
    
    // Convert to array and sort by blockTime (most recent first)
    const signatures = Array.from(allSignatures.values()).sort((a, b) => {
      const timeA = a.blockTime || 0;
      const timeB = b.blockTime || 0;
      return timeB - timeA;
    }).slice(0, 100); // Limit to 100 most recent

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

        // Check if this transaction involves the treasury wallet OR any registered wallet
        const treasuryIndex = accountKeys.findIndex(
          (key) => key.toString() === treasuryWallet
        );
        
        // Find all registered wallets in this transaction
        const registeredWalletIndices: number[] = [];
        walletMap.forEach((user, walletAddr) => {
          const index = accountKeys.findIndex(
            (key) => key.toString().toLowerCase() === walletAddr
          );
          if (index !== -1) {
            registeredWalletIndices.push(index);
          }
        });

        // Check if treasury sent (outgoing) OR registered wallet received (incoming)
        let isRelevantTransaction = false;
        let amountSOL = 0;
        let recipientAddress = '';
        let recipientIndex = -1;
        
        // Case 1: Treasury wallet sent (outgoing from treasury)
        if (treasuryIndex !== -1) {
          const treasuryBalanceChange = preBalances[treasuryIndex] - postBalances[treasuryIndex];
          if (treasuryBalanceChange > 0) {
            isRelevantTransaction = true;
            const transactionFee = tx.meta.fee || 0;
            amountSOL = (treasuryBalanceChange - transactionFee) / 1_000_000_000;
          }
        }
        
        // Case 2: Registered wallet received (incoming to registered wallet)
        if (!isRelevantTransaction && registeredWalletIndices.length > 0) {
          for (const walletIndex of registeredWalletIndices) {
            const walletBalanceChange = postBalances[walletIndex] - preBalances[walletIndex];
            if (walletBalanceChange > 0) {
              isRelevantTransaction = true;
              amountSOL = walletBalanceChange / 1_000_000_000;
              recipientAddress = accountKeys[walletIndex].toString().trim().toLowerCase();
              recipientIndex = walletIndex;
              break; // Found a recipient, no need to check others
            }
          }
        }

        if (isRelevantTransaction) {
          // amountSOL is already calculated above (line 150 or 160)
          // Find recipient - either from treasury outgoing or registered wallet incoming
          let foundRecipient = false;
          let targetUser = null;
          
          if (recipientIndex !== -1 && recipientAddress) {
            // We already found the recipient (incoming to registered wallet)
            targetUser = walletMap.get(recipientAddress);
          } else {
            // Treasury sent - find which registered wallet received it
            for (let i = 0; i < accountKeys.length; i++) {
              if (i === treasuryIndex) continue;
              
              const accountBalanceChange = postBalances[i] - preBalances[i];
              
              // If this account's balance increased, it's likely the recipient
              if (accountBalanceChange > 0) {
                const checkAddress = accountKeys[i].toString().trim().toLowerCase();
                const checkUser = walletMap.get(checkAddress);
                
                if (checkUser) {
                  recipientAddress = checkAddress;
                  targetUser = checkUser;
                  break;
                }
              }
            }
          }
          
          if (targetUser) {
            console.log(`Found match! Transaction ${sigInfo.signature} to ${recipientAddress} (user: ${targetUser.twitterHandle})`);
            
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

              console.log(`Recorded distribution: ${amountSOL} SOL to ${targetUser.twitterHandle}`);
              newDistributions++;
              totalAmount += amountSOL;
              foundRecipient = true;
            } else {
              console.log(`Distribution already exists for transaction ${sigInfo.signature}`);
              foundRecipient = true;
            }
          }
          
          // Debug: log if we found outgoing transaction but no user match
          if (!foundRecipient && amountSOL > 0.001) {
            // Get all recipients with balance increases for debugging
            const recipients = [];
            for (let i = 0; i < accountKeys.length; i++) {
              if (i === treasuryIndex) continue;
              const accountBalanceChange = postBalances[i] - preBalances[i];
              if (accountBalanceChange > 0) {
                recipients.push({
                  address: accountKeys[i].toString().trim().toLowerCase(),
                  balanceIncrease: accountBalanceChange / 1_000_000_000,
                });
              }
            }
            console.log(`Outgoing transaction ${sigInfo.signature}: ${amountSOL} SOL, recipients:`, JSON.stringify(recipients));
            console.log(`Registered wallets:`, Array.from(walletMap.keys()));
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
      firstFewSignatures: signatureList, // For debugging
      registeredWalletAddresses: Array.from(walletMap.keys()), // Show what wallets we're looking for
    });
  } catch (error: any) {
    console.error('Error monitoring distributions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to monitor distributions' },
      { status: 500 }
    );
  }
}

