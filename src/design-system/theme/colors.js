export const colors = {
  // Gray scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Primary colors (blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },

  // Special colors
  white: '#ffffff',
  black: '#000000',
};

export const lightTheme = {
  colors: {
    background: colors.white,
    surface: colors.gray[50],
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
      muted: colors.gray[500],
    },
    border: colors.gray[200],
    primary: colors.primary[600],
    primaryHover: colors.primary[700],
  },
};

export const darkTheme = {
  colors: {
    background: colors.gray[900],
    surface: colors.gray[800],
    text: {
      primary: colors.gray[100],
      secondary: colors.gray[300],
      muted: colors.gray[400],
    },
    border: colors.gray[700],
    primary: colors.primary[500],
    primaryHover: colors.primary[400],
  },
};