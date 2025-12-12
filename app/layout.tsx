import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './components/ThemeProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Grateful - Share What You\'re Grateful For',
  description: 'A memecoin community on Solana where we share gratitude in the trenches',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-body antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

