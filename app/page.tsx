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
        {/* Particle Background */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 20 + 10}px`,
                height: `${Math.random() * 20 + 10}px`,
                background: `radial-gradient(circle, rgba(255, 107, 157, 0.3), rgba(199, 125, 255, 0.2))`,
                animationDelay: `${Math.random() * 15}s`,
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
              className="text-5xl md:text-7xl font-display font-bold mb-4 bg-gradient-to-r from-grateful-primary via-grateful-secondary to-grateful-accent bg-clip-text text-transparent glow-text"
            >
              Grateful
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
          <footer className="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm">
            <p>Built with 💜 for the Solana community</p>
          </footer>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </Providers>
  );
}

