import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const isDarkOS = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    return isDarkOS;
  };

  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-webtui-theme', 'catppuccin-mocha');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-webtui-theme');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;
