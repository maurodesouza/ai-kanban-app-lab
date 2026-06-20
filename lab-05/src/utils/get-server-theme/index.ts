/**
 * Server-side theme resolution for the initial theme class.
 */

import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { DEFAULT_THEME, AVAILABLE_THEMES } from '@/utils/themes';
import type { Theme } from '@/types/themes';

const THEME_COOKIE_NAME = '@kanban-app:theme';

function parseThemeCookie(header: string | undefined): string | null {
  if (!header) return null;

  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;

    if (part.slice(0, eq) === THEME_COOKIE_NAME) {
      return part.slice(eq + 1);
    }
  }

  return null;
}

export const getServerTheme = createServerFn({ method: 'GET' }).handler(
  async () => {
    const cookieHeader = getRequestHeader('cookie');
    const themeCookie = parseThemeCookie(cookieHeader);

    if (!themeCookie) {
      return DEFAULT_THEME;
    }

    if (AVAILABLE_THEMES.includes(themeCookie as Theme)) {
      return themeCookie as Theme;
    }

    return DEFAULT_THEME;
  }
);

export async function getThemeClassName(): Promise<string> {
  const theme = await getServerTheme();
  return `theme-${theme}`;
}
