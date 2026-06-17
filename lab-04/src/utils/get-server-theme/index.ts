import { DEFAULT_THEME, AVAILABLE_THEMES } from '@/utils/themes';
import type { Theme } from '@/types/themes';

export function getServerTheme(cookieHeader: string | null): Theme {
  if (!cookieHeader) {
    return DEFAULT_THEME;
  }

  const cookies: Record<string, string> = {};
  for (const c of cookieHeader.split('; ')) {
    const eqIndex = c.indexOf('=');
    if (eqIndex > 0) {
      cookies[c.slice(0, eqIndex)] = c.slice(eqIndex + 1);
    }
  }
  const themeCookie = cookies['@kanban-app:theme'];

  if (!themeCookie) {
    return DEFAULT_THEME;
  }

  if (AVAILABLE_THEMES.includes(themeCookie as Theme)) {
    return themeCookie as Theme;
  }

  return DEFAULT_THEME;
}

export function getThemeClassName(cookieHeader: string | null): string {
  const theme = getServerTheme(cookieHeader);
  return `theme-${theme}`;
}
