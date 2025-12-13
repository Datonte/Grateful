import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { init, id } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://rpc.ankr.com/solana',
  'confirmed'
);

// Manual endpoint to check a specific transaction
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get('signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Transaction signature is required. Use ?signature=YOUR_TX_SIGNATURE' },
        { status: 400 }
      );
    }

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

    // Fetch the transaction
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.meta) {
      return NextResponse.json(
        { error: 'Transaction not found or invalid' },
        { status: 404 }
      );
    }

    const preBalances = tx.meta.preBalances || [];
    const postBalances = tx.meta.postBalances || [];

    // Get account keys
    let accountKeys: PublicKey[] = [];
    if ('getAccountKeys' in tx.transaction.message) {
      accountKeys = tx.transaction.message.getAccountKeys().staticAccountKeys;
    } else {
      accountKeys = (tx.transaction.message as any).accountKeys || [];
    }

    // Find registered wallets in this transaction
    const registeredWalletIndices: number[] = [];
    const walletInfo: any[] = [];
    
    walletMap.forEach((user, walletAddr) => {
      const index = accountKeys.findIndex(
        (key) => key.toString().toLowerCase() === walletAddr
      );
      if (index !== -1) {
        registeredWalletIndices.push(index);
        const balanceChange = postBalances[index] - preBalances[index];
        walletInfo.push({
          wallet: walletAddr,
          user: user.twitterHandle,
          index,
          balanceChange: balanceChange / 1_000_000_000,
          received: balanceChange > 0,
        });
      }
    });

    // Check if any registered wallet received SOL
    let matchedWallet = null;
    let amountSOL = 0;

    for (const info of walletInfo) {
      if (info.received) {
        matchedWallet = info;
        amountSOL = info.balanceChange;
        break;
      }
    }

    // Check if this distribution already exists
    const existingDist = await db.query({
      distributions: {
        $: {
          where: { transactionHash: signature },
        },
      },
    });

    const alreadyRecorded = existingDist?.distributions?.length > 0;

    // If we found a match and it's not recorded, record it
    if (matchedWallet && !alreadyRecorded) {
      const user = walletMap.get(matchedWallet.wallet);
      if (user) {
        const distId = id();
        await db.transact([
          db.tx.distributions[distId].update({
            userId: user.twitterId,
            walletAddress: matchedWallet.wallet,
            amount: amountSOL,
            transactionHash: signature,
            reason: 'Community reward',
            createdAt: tx.blockTime ? tx.blockTime * 1000 : Date.now(),
          }),
        ]);

        // Update total
        const tracking = await db.query({
          fee_tracking: {},
        });
        const trackingRecord = tracking?.fee_tracking?.[0];
        const trackingId = trackingRecord?.id || id();
        const currentTotal = trackingRecord?.totalGivenOut || 0;
        const newTotal = currentTotal + amountSOL;

        await db.transact([
          db.tx.fee_tracking[trackingId].update({
            totalGivenOut: newTotal,
            lastDistributionTime: Date.now(),
            lastCheckedTransaction: signature,
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: 'Transaction recorded successfully!',
          transaction: signature,
          wallet: matchedWallet.wallet,
          user: user.twitterHandle,
          amount: amountSOL,
          totalGivenOut: newTotal,
        });
      }
    }

    return NextResponse.json({
      success: true,
      transaction: signature,
      registeredWalletsInTx: walletInfo,
      matchedWallet: matchedWallet || null,
      amount: amountSOL || 0,
      alreadyRecorded,
      message: alreadyRecorded
        ? 'Transaction already recorded'
        : matchedWallet
        ? 'Transaction matched but recording failed'
        : 'No registered wallet received SOL in this transaction',
    });
  } catch (error: any) {
    console.error('Error checking transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check transaction' },
      { status: 500 }
    );
  }
}

