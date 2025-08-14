import { createContext, useContext, useEffect, useState } from 'react';
import { theme } from '../theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const isDarkOS = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDark, setIsDark] = useState(isDarkOS);

  const toggleTheme = () => setIsDark(!isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const currentTheme = {
    ...theme,
    mode: isDark ? 'dark' : 'light',
    colors: isDark ? theme.modes.dark.colors : theme.modes.light.colors,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={currentTheme}>
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