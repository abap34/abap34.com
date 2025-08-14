// WebTUI CSS Variables - these map to the CSS custom properties
export const webtui = {
  // WebTUI uses CSS variables for theming
  background: {
    0: 'var(--background0)',
    1: 'var(--background1)', 
    2: 'var(--background2)',
  },
  foreground: {
    0: 'var(--foreground0)',
    1: 'var(--foreground1)',
    2: 'var(--foreground2)',
  },
  accent: {
    0: 'var(--accent0)',
    1: 'var(--accent1)',
    2: 'var(--accent2)',
  },
  semantic: {
    red: 'var(--red)',
    orange: 'var(--orange)', 
    yellow: 'var(--yellow)',
    green: 'var(--green)',
    blue: 'var(--blue)',
    purple: 'var(--purple)',
  }
};

// Theme variants for WebTUI
export const lightTheme = {
  theme: 'catppuccin-latte',
  colors: webtui,
};

export const darkTheme = {
  theme: 'catppuccin-mocha', 
  colors: webtui,
};

// Backwards compatibility
export const colors = webtui;