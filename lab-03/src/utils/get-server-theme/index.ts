import { cookies } from 'next/headers';
import { DEFAULT_THEME, AVAILABLE_THEMES } from '@/utils/themes';
import type { Theme } from '@/utils/themes';

export async function getServerTheme(): Promise<string> {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('@kanban-app:theme');

  if (!themeCookie) {
    return DEFAULT_THEME;
  }

  const theme = themeCookie.value;

  // Validate theme is in available themes
  if (AVAILABLE_THEMES.includes(theme as Theme)) {
    return theme;
  }

  // Fallback to default theme if invalid
  return DEFAULT_THEME;
}

export async function getThemeClassName(): Promise<string> {
  const theme = await getServerTheme();
  return `theme-${theme}`;
}
