'use client';

import { createContext, useContext, useEffect } from 'react';

type Theme = 'light';

const ThemeContext = createContext<{
  theme: Theme;
}>({
  theme: 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Always use light mode - remove any dark class if present
    document.documentElement.classList.remove('dark');
    // Clear any saved dark theme preference
    localStorage.removeItem('theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

