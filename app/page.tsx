'use client';

import { AuthButton } from './components/AuthButton';
import { WelcomeMessage } from './components/WelcomeMessage';
import { PostForm } from './components/PostForm';
import { GratitudeFeed } from './components/GratitudeFeed';
import { ContractAddress } from './components/ContractAddress';
import { SocialButtons } from './components/SocialButtons';
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
        

        {/* Auth Button - Top Left */}
        <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50">
          <AuthButton />
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-2xl">
          {/* Header with Logo */}
          <header className="text-center mb-6 sm:mb-8 md:mb-12">
            {/* Image Composition - Logo Style */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-4 sm:mb-6 md:mb-8 flex justify-center"
            >
              <div className="relative w-full max-w-[85vw] sm:max-w-[80vw] md:max-w-[90vw] h-auto flex justify-center items-center">
                <img
                  src="/gratefullll.png"
                  alt="Grateful Logo"
                  className="w-full h-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px] object-contain"
                  style={{
                    filter: 'drop-shadow(0 8px 24px rgba(59, 130, 246, 0.3)) drop-shadow(0 4px 12px rgba(255, 215, 0, 0.2))',
                  }}
                />
              </div>
            </motion.div>
            <p className="text-white/90 text-sm xs:text-base sm:text-lg md:text-xl mb-4 sm:mb-5 md:mb-6 font-medium px-2">
              Share what you're grateful for in the Solana trenches
            </p>
          </header>

          {/* Contract Address */}
          <ContractAddress />

          {/* Fee Tracker */}
          <FeeTracker />

          {/* Social Buttons */}
          <SocialButtons />

          {/* Welcome Message */}
          <WelcomeMessage />

          {/* Post Form */}
          <PostForm />

          {/* Feed */}
          <GratitudeFeed />

          {/* Wallet Addresses List - Moved to Bottom */}
          <WalletAddressesList />

          {/* Footer */}
          <motion.footer 
            className="text-center mt-8 sm:mt-10 md:mt-12 text-white/80 text-xs sm:text-sm font-medium px-2"
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

      </div>
    </Providers>
  );
}

