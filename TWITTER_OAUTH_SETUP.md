# Twitter OAuth Configuration Troubleshooting

## Current Error: "Configuration"

This error means NextAuth cannot properly configure Twitter OAuth. Follow these steps:

## Step 1: Verify Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables:
1. **NEXTAUTH_URL**
   - Must be: `https://grateful-five.vercel.app` (or your custom domain)
   - NO trailing slash
   - Must match your actual deployment URL exactly

2. **TWITTER_CLIENT_ID**
   - From Twitter Developer Portal
   - Should start with letters/numbers

3. **TWITTER_CLIENT_SECRET**
   - From Twitter Developer Portal
   - Keep this secret!

4. **NEXTAUTH_SECRET**
   - Random string (generate with: `openssl rand -base64 32`)
   - Must be the same across all environments

### After updating:
- **Redeploy** your project (Vercel → Deployments → Redeploy)

## Step 2: Verify Twitter Developer Portal

Go to: **https://developer.twitter.com/en/portal**

### Settings to Check:

1. **App Settings → User authentication settings**
   - **App permissions**: Read (minimum)
   - **Type of App**: Web App, Automated App or Bot
   - **Callback URI / Redirect URL**: 
     ```
     https://grateful-five.vercel.app/api/auth/callback/twitter
     ```
     OR if using custom domain:
     ```
     https://gratefulonsol.fun/api/auth/callback/twitter
     ```
   - **Website URL**: 
     ```
     https://grateful-five.vercel.app
     ```
     OR:
     ```
     https://gratefulonsol.fun
     ```

2. **Keys and tokens**
   - Copy **OAuth 2.0 Client ID** → Use as `TWITTER_CLIENT_ID`
   - Copy **OAuth 2.0 Client Secret** → Use as `TWITTER_CLIENT_SECRET`

## Step 3: Common Issues

### Issue 1: NEXTAUTH_URL Mismatch
- **Symptom**: Configuration error
- **Fix**: Ensure `NEXTAUTH_URL` in Vercel matches your actual domain exactly

### Issue 2: Callback URL Mismatch
- **Symptom**: Redirects to error page
- **Fix**: Callback URL in Twitter must match: `https://your-domain.com/api/auth/callback/twitter`

### Issue 3: Missing Environment Variables
- **Symptom**: Build fails or runtime errors
- **Fix**: Add all required variables in Vercel

### Issue 4: Wrong OAuth Version
- **Symptom**: Authentication fails
- **Fix**: Ensure you're using OAuth 2.0 (not 1.0a) in Twitter Developer Portal

## Step 4: Testing

1. Clear browser cache and cookies
2. Visit: `https://grateful-five.vercel.app`
3. Click "Connect Twitter"
4. Should redirect to Twitter login
5. After authorizing, should redirect back to your site

## Quick Checklist

- [ ] `NEXTAUTH_URL` set in Vercel (matches your domain)
- [ ] `TWITTER_CLIENT_ID` set in Vercel
- [ ] `TWITTER_CLIENT_SECRET` set in Vercel
- [ ] `NEXTAUTH_SECRET` set in Vercel
- [ ] Callback URL in Twitter Developer Portal matches: `https://your-domain.com/api/auth/callback/twitter`
- [ ] Website URL in Twitter Developer Portal matches: `https://your-domain.com`
- [ ] OAuth 2.0 enabled in Twitter Developer Portal
- [ ] Project redeployed after updating environment variables

## Still Not Working?

1. Check Vercel deployment logs for errors
2. Check browser console (F12) for errors
3. Verify all environment variables are set (not empty)
4. Try generating a new `NEXTAUTH_SECRET` and updating it
5. Double-check callback URL has no typos or extra characters

