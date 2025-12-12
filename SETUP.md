# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
NEXT_PUBLIC_INSTANT_APP_ID=d16ae845-f359-4bad-8b78-45da1668a002
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Get Twitter OAuth Credentials:
1. Go to https://developer.twitter.com
2. Create a new app
3. Enable OAuth 2.0
4. Set callback URL: `http://localhost:3000/api/auth/callback/twitter`
5. Copy Client ID and Client Secret

## Step 3: Set Up Instant DB

1. Go to https://instant.dev
2. Create an account
3. Create a new app with ID: `d16ae845-f359-4bad-8b78-45da1668a002`
4. Set up the schema:

**Users Table:**
- `id` (string, primary key)
- `twitterId` (string, unique)
- `username` (string)
- `twitterHandle` (string)
- `createdAt` (number)

**Gratitude Posts Table:**
- `id` (string, primary key)
- `userId` (string, foreign key to users)
- `content` (string)
- `createdAt` (number)
- `reactions` (number)

## Step 4: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 5: Add Favicon (Optional)

Place your `favicon.ico` file in the `public/` directory.

## Production Deployment

### Vercel

1. Push code to GitHub
2. Import repository on Vercel
3. Add environment variables
4. Update `NEXTAUTH_URL` to production URL
5. Update Twitter callback URL to: `https://your-domain.com/api/auth/callback/twitter`
6. Deploy!

