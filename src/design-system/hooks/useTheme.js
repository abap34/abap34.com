import { createContext, useContext, useEffect, useState } from 'react';
import { theme } from '../theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const isDarkOS = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDark, setIsDark] = useState(isDarkOS);

  const toggleTheme = () => setIsDark(!isDark);

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.setAttribute('data-webtui-theme', 'catppuccin-mocha');
      root.classList.add('dark');
    } else {
      root.removeAttribute('data-webtui-theme');
      root.classList.remove('dark');
    }
  }, [isDark]);

  const currentTheme = {
    ...theme,
    mode: isDark ? 'dark' : 'light',
    colors: isDark ? theme.modes.dark.colors : theme.modes.light.colors,
    webtui: isDark ? 'catppuccin-mocha' : 'catppuccin-latte',
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