import { useEffect, useState } from 'react';

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('aic-theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('aic-theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return {
    darkMode,
    toggleTheme: () => setDarkMode((current) => !current),
  };
};
