import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeContextValue = {
  isDark: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  return (
    <ThemeContext.Provider value={{ isDark, toggleDarkMode: () => setIsDark(current => !current) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
