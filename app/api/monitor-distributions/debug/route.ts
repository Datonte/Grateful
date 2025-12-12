import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { init } from '@instantdb/admin';

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

// Debug endpoint to see what's happening
export async function GET(request: NextRequest) {
  try {
    const treasuryWallet = process.env.TREASURY_WALLET_ADDRESS;
    if (!treasuryWallet) {
      return NextResponse.json(
        { error: 'Treasury wallet not configured' },
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

    const registeredWallets = (users?.users || []).map((user: any) => ({
      twitterHandle: user.twitterHandle,
      walletAddress: user.walletAddress,
      normalized: user.walletAddress?.trim().toLowerCase(),
    }));

    // Get recent transactions
    const treasuryPubkey = new PublicKey(treasuryWallet);
    const signatures = await connection.getSignaturesForAddress(treasuryPubkey, {
      limit: 10,
    });

    const recentTransactions = [];

    for (const sigInfo of signatures.slice(0, 5)) {
      try {
        const tx = await connection.getTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx || !tx.meta) continue;

        const preBalances = tx.meta.preBalances || [];
        const postBalances = tx.meta.postBalances || [];

        let accountKeys: PublicKey[] = [];
        if ('getAccountKeys' in tx.transaction.message) {
          accountKeys = tx.transaction.message.getAccountKeys().staticAccountKeys;
        } else {
          accountKeys = (tx.transaction.message as any).accountKeys || [];
        }

        const treasuryIndex = accountKeys.findIndex(
          (key) => key.toString() === treasuryWallet
        );

        if (treasuryIndex !== -1) {
          const balanceChange = preBalances[treasuryIndex] - postBalances[treasuryIndex];
          const transactionFee = tx.meta.fee || 0;
          const amountSOL = balanceChange > 0 ? (balanceChange - transactionFee) / 1_000_000_000 : 0;

          const recipients = accountKeys
            .map((key, i) => ({
              address: key.toString(),
              normalized: key.toString().trim().toLowerCase(),
              index: i,
              isTreasury: i === treasuryIndex,
            }))
            .filter((acc) => !acc.isTreasury);

          recentTransactions.push({
            signature: sigInfo.signature,
            blockTime: sigInfo.blockTime,
            balanceChange: balanceChange / 1_000_000_000,
            transactionFee: transactionFee / 1_000_000_000,
            amountSOL,
            isOutgoing: balanceChange > 0,
            recipients: recipients.map((r) => r.normalized),
            matchedUser: recipients.find((r) =>
              registeredWallets.some((w) => w.normalized === r.normalized)
            )?.address,
          });
        }
      } catch (error) {
        console.error(`Error processing ${sigInfo.signature}:`, error);
      }
    }

    return NextResponse.json({
      treasuryWallet,
      registeredWallets,
      recentTransactions,
      totalRegistered: registeredWallets.length,
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to debug' },
      { status: 500 }
    );
  }
}

