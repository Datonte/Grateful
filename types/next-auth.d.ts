import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      twitterHandle?: string;
    };
  }

  interface User {
    id: string;
    twitterHandle?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    twitterHandle?: string;
  }
}

