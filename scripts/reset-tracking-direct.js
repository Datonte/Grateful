// Direct database reset script
// Reads from .env.local or environment variables
// Run with: node scripts/reset-tracking-direct.js

const fs = require('fs');
const path = require('path');
const { init, id } = require('@instantdb/admin');

// Try to load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const adminToken = process.env.INSTANT_ADMIN_TOKEN;

if (!appId || !adminToken) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Please set NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN');
  console.error('Either in .env.local or as environment variables');
  process.exit(1);
}

const db = init({ appId, adminToken });

async function resetTracking() {
  try {
    console.log('Resetting fee tracking to 0...');

    const tracking = await db.query({ fee_tracking: {} });
    const trackingRecord = tracking?.fee_tracking?.[0];
    const trackingId = trackingRecord?.id || id();

    await db.transact([
      db.tx.fee_tracking[trackingId].update({
        totalGivenOut: 0,
        lastDistributionTime: Date.now(),
        lastCheckedTransaction: '',
      }),
    ]);

    console.log('✅ Fee tracking reset to 0 SOL successfully!');
    console.log('The system will now only track new transactions from treasury to registered wallets.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetTracking();

