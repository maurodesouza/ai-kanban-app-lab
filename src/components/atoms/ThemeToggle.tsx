import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export const ThemeToggle = () => {
  const { theme, systemTheme, effectiveTheme, setTheme, toggleTheme, isLight, isDark, isSystem } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleQuickToggle = () => {
    toggleTheme();
  };

  return (
    <div className="relative">
      {/* Quick toggle button */}
      <button
        onClick={handleQuickToggle}
        className="p-2 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors"
        aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
        title={`Current theme: ${theme}. Click to toggle.`}
      >
        {isLight ? (
          <Sun className="w-5 h-5 text-foreground-600" />
        ) : (
          <Moon className="w-5 h-5 text-foreground-600" />
        )}
      </button>

      {/* Theme selector dropdown */}
      <div className="absolute top-full right-0 mt-2 p-2 bg-surface-0 border border-surface-200 rounded-lg shadow-lg min-w-48 z-50">
        <div className="space-y-1">
          <button
            onClick={() => handleThemeChange('light')}
            className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
              theme === 'light' 
                ? 'bg-primary-100 text-primary-700' 
                : 'hover:bg-surface-100 text-foreground-700'
            }`}
            aria-pressed={theme === 'light'}
          >
            <Sun className="w-4 h-4" />
            <span className="text-sm">Light</span>
            {theme === 'light' && (
              <div className="w-2 h-2 bg-primary-600 rounded-full ml-auto" />
            )}
          </button>

          <button
            onClick={() => handleThemeChange('dark')}
            className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
              theme === 'dark' 
                ? 'bg-primary-100 text-primary-700' 
                : 'hover:bg-surface-100 text-foreground-700'
            }`}
            aria-pressed={theme === 'dark'}
          >
            <Moon className="w-4 h-4" />
            <span className="text-sm">Dark</span>
            {theme === 'dark' && (
              <div className="w-2 h-2 bg-primary-600 rounded-full ml-auto" />
            )}
          </button>

          <button
            onClick={() => handleThemeChange('system')}
            className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
              theme === 'system' 
                ? 'bg-primary-100 text-primary-700' 
                : 'hover:bg-surface-100 text-foreground-700'
            }`}
            aria-pressed={theme === 'system'}
          >
            <Monitor className="w-4 h-4" />
            <span className="text-sm">System</span>
            {theme === 'system' && (
              <div className="w-2 h-2 bg-primary-600 rounded-full ml-auto" />
            )}
          </button>
        </div>

        {theme === 'system' && (
          <div className="mt-2 pt-2 border-t border-surface-200">
            <div className="text-xs text-foreground-500">
              System preference: {systemTheme}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
