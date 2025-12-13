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
        {/* Sun for light mode */}
        <div className="sun-container"></div>
        
        {/* Moon for dark mode */}
        <div className="moon-container"></div>
        
        {/* Enhanced Cloud Background - Sky Theme */}
        <div className="particles">
          {/* Larger floating clouds - positioned in top portion */}
          {[...Array(8)].map((_, i) => {
            const width = Math.random() * 80 + 80;
            const height = Math.random() * 50 + 40;
            // Position clouds in top 0-60% of screen, favoring top
            const topPosition = Math.random() * 60;
            return (
              <div
                key={`cloud-large-${i}`}
                className="particle cloud-particle cloud-large hidden sm:block"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${topPosition}%`,
                  width: `${width}px`,
                  height: `${height}px`,
                  animationDelay: `${Math.random() * 20}s`,
                  animationDuration: `${Math.random() * 10 + 20}s`,
                }}
              />
            );
          })}
          {/* Medium clouds - positioned in top portion */}
          {[...Array(12)].map((_, i) => {
            const width = Math.random() * 50 + 50;
            const height = Math.random() * 35 + 30;
            // Position clouds in top 0-65% of screen
            const topPosition = Math.random() * 65;
            return (
              <div
                key={`cloud-medium-${i}`}
                className="particle cloud-particle cloud-medium"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${topPosition}%`,
                  width: `${width}px`,
                  height: `${height}px`,
                  animationDelay: `${Math.random() * 25}s`,
                  animationDuration: `${Math.random() * 8 + 18}s`,
                }}
              />
            );
          })}
          {/* Small clouds for depth - positioned in top portion */}
          {[...Array(15)].map((_, i) => {
            const width = Math.random() * 40 + 30;
            const height = Math.random() * 25 + 20;
            // Position clouds in top 0-70% of screen
            const topPosition = Math.random() * 70;
            return (
              <div
                key={`cloud-small-${i}`}
                className="particle cloud-particle cloud-small"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${topPosition}%`,
                  width: `${width}px`,
                  height: `${height}px`,
                  animationDelay: `${Math.random() * 30}s`,
                  animationDuration: `${Math.random() * 6 + 15}s`,
                }}
              />
            );
          })}
          {/* Golden light particles for degen energy */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`gold-${i}`}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 12 + 6}px`,
                height: `${Math.random() * 12 + 6}px`,
                background: `radial-gradient(circle, rgba(255, 215, 0, 0.5), rgba(255, 237, 78, 0.2))`,
                animationDelay: `${Math.random() * 15}s`,
                boxShadow: `0 0 ${Math.random() * 8 + 6}px rgba(255, 215, 0, 0.4)`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-2xl">
          {/* Header with Logo */}
          <header className="text-center mb-6 sm:mb-8 md:mb-12">
            {/* Primary Logo - More Prominent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-4 sm:mb-6 md:mb-8 flex justify-center"
            >
              <div className="relative">
                <img
                  src="/logo.jpeg.jpeg"
                  alt="Grateful Logo"
                  className="h-32 xs:h-40 sm:h-48 md:h-56 lg:h-72 w-auto max-w-[85vw] sm:max-w-[80vw] md:max-w-[90vw] object-contain"
                  style={{
                    filter: 'drop-shadow(0 8px 24px rgba(59, 130, 246, 0.3)) drop-shadow(0 4px 12px rgba(255, 215, 0, 0.2))',
                  }}
                />
              </div>
            </motion.div>
            {/* Simplified, Elegant Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-3 sm:mb-4 text-white dark:text-white relative inline-block"
              style={{
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), -2px -2px 4px rgba(0, 0, 0, 0.5), 2px -2px 4px rgba(0, 0, 0, 0.5), -2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)',
              }}
            >
              Grateful
            </motion.h1>
            <p className="text-white/90 dark:text-white/90 text-sm xs:text-base sm:text-lg md:text-xl mb-4 sm:mb-5 md:mb-6 font-medium px-2"
              style={{
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), -2px -2px 4px rgba(0, 0, 0, 0.5), 2px -2px 4px rgba(0, 0, 0, 0.5), -2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(0, 0, 0, 0.3)',
              }}
            >
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
            className="text-center mt-8 sm:mt-10 md:mt-12 text-white/80 dark:text-white/80 text-xs sm:text-sm font-medium px-2"
            style={{
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), -2px -2px 4px rgba(0, 0, 0, 0.5), 2px -2px 4px rgba(0, 0, 0, 0.5), -2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(0, 0, 0, 0.3)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
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

