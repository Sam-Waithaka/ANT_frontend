import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type ThemeContextValue = {
  darkMode: boolean;
  setTheme: (darkMode: boolean) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = 'aic-theme';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const readInitialTheme = () =>
  typeof window !== 'undefined' && window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(readInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const value = useMemo<ThemeContextValue>(() => ({
    darkMode,
    setTheme: setDarkMode,
    toggleTheme: () => setDarkMode((current) => !current),
  }), [darkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used within ThemeProvider.');
  return theme;
};
