import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

if (!process.env.TWITTER_CLIENT_ID) {
  throw new Error('TWITTER_CLIENT_ID is not set');
}

if (!process.env.TWITTER_CLIENT_SECRET) {
  throw new Error('TWITTER_CLIENT_SECRET is not set');
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET?.trim(),
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID?.trim() || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET?.trim() || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all sign-ins for now
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // Ensure we always have an ID
        session.user.id = (token.sub as string) || (token.id as string) || '';
        session.user.twitterHandle = (token.twitterHandle as string) || '';
      }
      return session;
    },
    async jwt({ token, account, profile, user }) {
      // Initial sign in - account and profile are only available on first call
      if (account && profile) {
        // OAuth 2.0 returns username in profile.data.username
        // OAuth 1.0a returns it in profile.screen_name
        // Also check user object as fallback
        const username = 
          (profile as any).data?.username || 
          (profile as any).username || 
          (profile as any).screen_name ||
          (user as any)?.name ||
          '';

        if (username) {
          token.twitterHandle = username;
        }

        // Set user ID - try multiple sources
        if (account.providerAccountId) {
          token.sub = String(account.providerAccountId);
        } else if (account.id) {
          token.sub = String(account.id);
        } else if ((user as any)?.id) {
          token.sub = String((user as any).id);
        } else {
          // Fallback: generate a stable ID from account
          token.sub = account.provider || 'twitter';
        }
      }
      
      return token;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  // Add trustHost for Vercel
  trustHost: true,
});
