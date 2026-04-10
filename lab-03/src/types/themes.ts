export type Theme = 'light' | 'dark';

export type ThemeConfig = {
  name: Theme;
  displayName: string;
  icon?: string;
  description?: string;
};
