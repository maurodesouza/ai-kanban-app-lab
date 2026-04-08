import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeSystemTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      systemTheme: 'light',
      effectiveTheme: 'light',
      
      setTheme: (theme: Theme) => {
        const { systemTheme } = get();
        const effectiveTheme = 
          theme === 'system' ? systemTheme : theme;
        
        set({ theme, effectiveTheme });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(effectiveTheme);
          document.documentElement.setAttribute('data-theme', effectiveTheme);
        }
      },
      
      toggleTheme: () => {
        const { effectiveTheme } = get();
        const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      
      initializeSystemTheme: () => {
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const systemTheme = mediaQuery.matches ? 'dark' : 'light';
          
          // Update system theme
          set({ systemTheme });
          
          // If current theme is 'system', update effective theme
          const { theme } = get();
          if (theme === 'system') {
            set({ effectiveTheme: systemTheme });
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(systemTheme);
            document.documentElement.setAttribute('data-theme', systemTheme);
          }
          
          // Listen for system theme changes
          const handleChange = (e: MediaQueryListEvent) => {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            set({ systemTheme: newSystemTheme });
            
            if (get().theme === 'system') {
              set({ effectiveTheme: newSystemTheme });
              document.documentElement.classList.remove('light', 'dark');
              document.documentElement.classList.add(newSystemTheme);
              document.documentElement.setAttribute('data-theme', newSystemTheme);
            }
          };
          
          mediaQuery.addEventListener('change', handleChange);
          
          // Cleanup function
          return () => {
            mediaQuery.removeEventListener('change', handleChange);
          };
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
