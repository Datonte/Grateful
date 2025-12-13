// Script to reset fee tracking to 0 via API endpoint
// Run with: node scripts/reset-tracking.js [API_URL]
// Example: node scripts/reset-tracking.js http://localhost:3000
// Or: node scripts/reset-tracking.js https://your-app.vercel.app

const apiUrl = process.argv[2] || 'http://localhost:3000';

async function resetTracking() {
  try {
    console.log(`Resetting fee tracking via ${apiUrl}/api/reset-balance...`);
    
    const response = await fetch(`${apiUrl}/api/reset-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clearDistributions: false }), // Keep distributions for history
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Success:', result.message);
    console.log(`Total reset to: ${result.totalGivenOut} SOL`);
  } catch (error) {
    console.error('❌ Error resetting tracking:', error.message);
    console.error('\nMake sure:');
    console.error('1. Your dev server is running (npm run dev)');
    console.error('2. Or provide the production URL as an argument');
    console.error('   Example: node scripts/reset-tracking.js https://your-app.vercel.app');
    process.exit(1);
  }
}

resetTracking();
