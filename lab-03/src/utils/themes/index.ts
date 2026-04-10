/**
 * Theme configuration for the kanban app
 */

export type Theme = 'light' | 'dark';

export const AVAILABLE_THEMES: Theme[] = ['dark', 'light'];

export const DEFAULT_THEME: Theme = 'dark';

export type ThemeConfig = {
  name: Theme;
  displayName: string;
  icon?: string;
  description?: string;
};

export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  dark: {
    name: 'dark',
    displayName: 'Dark',
    description: 'Classic dark theme',
  },
  light: {
    name: 'light',
    displayName: 'Light',
    description: 'Clean light theme',
  },
};

export function getNextTheme(currentTheme: Theme): Theme {
  const currentIndex = AVAILABLE_THEMES.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
  return AVAILABLE_THEMES[nextIndex];
}

export function isValidTheme(theme: string): theme is Theme {
  return AVAILABLE_THEMES.includes(theme as Theme);
}

export const themes = {
  AVAILABLE_THEMES,
  DEFAULT_THEME,
  THEME_CONFIGS,
  getNextTheme,
  isValidTheme,
};
