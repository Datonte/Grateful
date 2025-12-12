# Grateful - Solana Memecoin Community

A beautiful, interactive website for the Grateful memecoin community where users can share what they're grateful for in the Solana trenches.

## Features

- 🐦 **Twitter Authentication** - Login with your Twitter account
- 💜 **Share Gratitude** - Post what you're grateful for (280 character limit)
- 🌓 **Dark/Light Mode** - Toggle between themes
- ⚡ **Real-time Updates** - See posts instantly with Instant DB
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🎨 **Beautiful Animations** - Interactive UI with Framer Motion
- 🔗 **Social Integration** - Share posts to Twitter with $GRATEFUL ticker
- 📋 **Contract Address** - Easy copy-to-clipboard functionality
- 💰 **Automatic Fee Tracking** - Real-time tracking of community rewards distributed

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **NextAuth.js** - Twitter OAuth authentication
- **Instant DB** - Real-time database
- **Solana Web3.js** - Blockchain transaction monitoring
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Twitter Developer Account (for OAuth)
- Instant DB account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd grateful
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   TWITTER_CLIENT_ID=your-twitter-client-id
   TWITTER_CLIENT_SECRET=your-twitter-client-secret
   NEXT_PUBLIC_INSTANT_APP_ID=d16ae845-f359-4bad-8b78-45da1668a002
   INSTANT_ADMIN_TOKEN=your-instant-admin-token
   TREASURY_WALLET_ADDRESS=your-treasury-wallet-address
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

   **Get Twitter OAuth credentials:**
   1. Go to [Twitter Developer Portal](https://developer.twitter.com)
   2. Create a new app
   3. Enable OAuth 2.0
   4. Set callback URL: `http://localhost:3000/api/auth/callback/twitter`
   5. Copy Client ID and Client Secret

4. **Set up Instant DB**

   Go to [Instant.dev](https://instant.dev) and:
   1. Create an account
   2. Create a new app with your app ID: `d16ae845-f359-4bad-8b78-45da1668a002`
   3. Get your admin token from the Instant DB dashboard
   4. Set up the schema:
      - `users` table with fields: `id`, `twitterId`, `username`, `twitterHandle`, `walletAddress`, `createdAt`
      - `gratitude_posts` table with fields: `id`, `userId`, `content`, `createdAt`, `reactions`
      - `distributions` table with fields: `id`, `userId`, `walletAddress`, `amount`, `transactionHash`, `reason`, `createdAt`
      - `fee_tracking` table with fields: `id`, `totalGivenOut`, `lastDistributionTime`, `lastCheckedTransaction`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Update `NEXTAUTH_URL` to your production URL
5. Update Twitter callback URL to: `https://your-domain.com/api/auth/callback/twitter`
6. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Same secret from development
- `TWITTER_CLIENT_ID` - Your Twitter Client ID
- `TWITTER_CLIENT_SECRET` - Your Twitter Client Secret
- `NEXT_PUBLIC_INSTANT_APP_ID` - Your Instant DB App ID
- `INSTANT_ADMIN_TOKEN` - Your Instant DB Admin Token
- `TREASURY_WALLET_ADDRESS` - Your Solana wallet address for sending rewards
- `SOLANA_RPC_URL` - Solana RPC endpoint (default: https://api.mainnet-beta.solana.com)

## Project Structure

```
grateful/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── components/
│   │   ├── AuthButton.tsx
│   │   ├── ContractAddress.tsx
│   │   ├── GratitudeFeed.tsx
│   │   ├── GratitudePost.tsx
│   │   ├── PostForm.tsx
│   │   ├── SocialButtons.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── WelcomeMessage.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── instant.ts
│   │   └── utils.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   └── favicon.ico
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Features in Detail

### Authentication
- Users must connect with Twitter to post
- Session persists until logout or browser close
- Username is automatically pulled from Twitter handle

### Posting
- 280 character limit (Twitter-style)
- Real-time character counter
- Text-only posts
- Instant submission with Instant DB

### Feed
- Chronological feed (newest first)
- Shows all posts (no authentication needed to view)
- Beautiful card-based design
- Relative timestamps ("2h ago", "just now")

### Social Features
- Heart reactions (emoji reactions)
- Share to Twitter with $GRATEFUL ticker
- Contract address with copy button
- Links to Twitter and Dexscreener

### Fee Tracking
- Users can optionally provide their Solana wallet address when posting
- Automatic monitoring of treasury wallet transactions every 5 minutes
- Real-time display of total SOL distributed as community rewards
- Transactions are automatically matched to registered users
- All distributions are tracked with transaction hashes for transparency

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:
```javascript
colors: {
  grateful: {
    primary: '#FF6B9D',
    secondary: '#C77DFF',
    accent: '#FFD93D',
    // ...
  },
}
```

### Contract Address
Update the placeholder in `app/components/ContractAddress.tsx`:
```typescript
const PLACEHOLDER_ADDRESS = 'YourActualContractAddress';
```

## License

MIT

## Support

Built with 💜 for the Solana community

