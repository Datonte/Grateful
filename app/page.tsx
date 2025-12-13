'use client';

import { AuthButton } from './components/AuthButton';
import { WelcomeMessage } from './components/WelcomeMessage';
import { PostForm } from './components/PostForm';
import { GratitudeFeed } from './components/GratitudeFeed';
import { ContractAddress } from './components/ContractAddress';
import { SocialButtons } from './components/SocialButtons';
import { ThemeToggle } from './components/ThemeToggle';
import { FeeTracker } from './components/FeeTracker';
import { WalletAddressesList } from './components/WalletAddressesList';
import { Providers } from './providers';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <Providers>
      <div className="min-h-screen relative">
        {/* Particle Background - Sky & Golden Theme */}
        <div className="particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={`gold-${i}`}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 15 + 8}px`,
                height: `${Math.random() * 15 + 8}px`,
                background: `radial-gradient(circle, rgba(255, 215, 0, 0.4), rgba(255, 237, 78, 0.2))`,
                animationDelay: `${Math.random() * 15}s`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(255, 215, 0, 0.3)`,
              }}
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <div
              key={`cloud-${i}`}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 30 + 20}px`,
                height: `${Math.random() * 20 + 15}px`,
                background: `radial-gradient(ellipse, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.2))`,
                animationDelay: `${Math.random() * 20}s`,
                borderRadius: '50%',
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
          {/* Header */}
          <header className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display font-bold mb-4 bg-gradient-to-r from-grateful-primary via-grateful-accent to-grateful-secondary bg-clip-text text-transparent glow-text relative inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Grateful
              <motion.span
                className="absolute -top-2 -right-2 text-2xl"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                ✨
              </motion.span>
            </motion.h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl mb-6">
              Share what you're grateful for in the Solana trenches
            </p>
            <div className="flex items-center justify-center gap-4">
              <AuthButton />
            </div>
          </header>

          {/* Contract Address */}
          <ContractAddress />

          {/* Fee Tracker */}
          <FeeTracker />

          {/* Wallet Addresses List */}
          <WalletAddressesList />

          {/* Social Buttons */}
          <SocialButtons />

          {/* Welcome Message */}
          <WelcomeMessage />

          {/* Post Form */}
          <PostForm />

          {/* Feed */}
          <GratitudeFeed />

          {/* Footer */}
          <motion.footer 
            className="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="flex items-center justify-center gap-2">
              Built with 
              <motion.span
                animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💜
              </motion.span>
              for the Solana community
            </p>
          </motion.footer>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </Providers>
  );
}

