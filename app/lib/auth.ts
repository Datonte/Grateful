import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all sign-ins for now
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.twitterHandle = token.twitterHandle as string;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // OAuth 2.0 returns username in profile.data.username
        // OAuth 1.0a returns it in profile.screen_name
        const username = (profile as any).data?.username || 
                        (profile as any).username || 
                        (profile as any).screen_name;
        if (username) {
          token.twitterHandle = username;
        }
        if (account.providerAccountId) {
          token.sub = account.providerAccountId;
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
});

