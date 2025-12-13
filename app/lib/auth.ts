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
      try {
        // Allow all sign-ins for now
        return true;
      } catch (error: any) {
        // Handle rate limit errors gracefully
        if (error?.status === 429 || error?.code === 88) {
          console.error('Twitter API rate limit exceeded. Please try again later.');
          // Still allow sign-in to proceed, but log the error
          return true;
        }
        console.error('Sign in error:', error);
        return true; // Allow sign-in to proceed even on errors
      }
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
  // Add error handling
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('Sign in event:', { userId: user.id, provider: account?.provider });
    },
    async signOut() {
      console.log('Sign out event');
    },
    async createUser({ user }) {
      console.log('User created:', user.id);
    },
    async updateUser({ user }) {
      console.log('User updated:', user.id);
    },
    async linkAccount({ user, account, profile }) {
      console.log('Account linked:', { userId: user.id, provider: account.provider });
    },
  },
});
