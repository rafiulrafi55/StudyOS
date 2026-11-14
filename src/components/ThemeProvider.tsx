import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@studyos/theme';

type ThemeContextValue = {
  isDark: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [isThemeHydrated, setIsThemeHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(value => {
        if (isMounted && (value === 'true' || value === 'false')) {
          setIsDark(value === 'true');
        }
      })
      .catch(error => {
        console.error('Failed to load local StudyOS theme:', error);
      })
      .finally(() => {
        if (isMounted) setIsThemeHydrated(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isThemeHydrated) return;

    AsyncStorage.setItem(THEME_STORAGE_KEY, String(isDark)).catch(error => {
      console.error('Failed to save local StudyOS theme:', error);
    });
  }, [isDark, isThemeHydrated]);

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
