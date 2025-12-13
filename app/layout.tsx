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
    icon: '/logo.jpeg.jpeg',
    apple: '/logo.jpeg.jpeg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
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
        <link rel="icon" href="/logo.jpeg.jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpeg.jpeg" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-body antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

