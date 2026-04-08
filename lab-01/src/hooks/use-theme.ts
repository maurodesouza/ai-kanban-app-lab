import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme';

export const useTheme = () => {
  const {
    theme,
    systemTheme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    initializeSystemTheme,
  } = useThemeStore();

  // Initialize system theme on mount
  useEffect(() => {
    const cleanup = initializeSystemTheme();
    return cleanup;
  }, [initializeSystemTheme]);

  // Apply theme to document whenever effectiveTheme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(effectiveTheme);
      document.documentElement.setAttribute('data-theme', effectiveTheme);
    }
  }, [effectiveTheme]);

  return {
    theme,
    systemTheme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    isLight: effectiveTheme === 'light',
    isDark: effectiveTheme === 'dark',
    isSystem: theme === 'system',
  };
};
