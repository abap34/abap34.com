import { colors, lightTheme, darkTheme } from './colors';
import { typography } from './typography';
import { spacing, sizes, borderRadius, shadows } from './spacing';

export * from './colors';
export * from './typography';
export * from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  sizes,
  borderRadius,
  shadows,
  modes: {
    light: lightTheme,
    dark: darkTheme,
  },
};