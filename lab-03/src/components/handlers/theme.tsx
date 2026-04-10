'use client';

import { useEffect, useCallback } from 'react';
import { events } from '@/events';
import { Events } from '@/types/events';
import { cookie } from '@/utils/cookies';
import { themes, type Theme } from '@/utils/themes';
import type { ThemeSetPayload } from '@/events/handles/theme';

function getTheme(): string {
  return cookie.get('theme') || themes.DEFAULT_THEME;
}

function setTheme(theme: string): void {
  cookie.set('theme', theme);
}

function validateAndFallbackTheme(theme: string): Theme {
  if (!themes.isValidTheme(theme)) {
    console.warn(
      `Invalid theme: ${theme}, falling back to ${themes.DEFAULT_THEME}`
    );
    return themes.DEFAULT_THEME;
  }
  return theme as Theme;
}

function ThemeHandler() {
  const applyTheme = useCallback((theme: string) => {
    if (typeof document === 'undefined') {
      return;
    }

    const body = document.body;

    // Remove all existing theme classes
    themes.AVAILABLE_THEMES.forEach((t: Theme) => {
      body.classList.remove(`theme-${t}`);
    });

    // Add new theme class
    body.classList.add(`theme-${theme}`);
  }, []);

  const onToggle = useCallback(() => {
    const currentTheme = getTheme();
    const validTheme = validateAndFallbackTheme(currentTheme);

    const newTheme = themes.getNextTheme(validTheme);
    setTheme(newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  const onSet = useCallback(
    (event: CustomEvent<ThemeSetPayload>) => {
      const { theme } = event.detail;
      const validTheme = validateAndFallbackTheme(theme);

      setTheme(validTheme);
      applyTheme(validTheme);
    },
    [applyTheme]
  );

  useEffect(() => {
    // Apply initial theme from cookies
    const initialTheme = getTheme();
    const validTheme = validateAndFallbackTheme(initialTheme);

    setTheme(validTheme);
    applyTheme(validTheme);

    // Listen to theme events
    events.on(Events.THEME_TOGGLE, onToggle);
    events.on(Events.THEME_SET, onSet);

    return () => {
      events.off(Events.THEME_TOGGLE, onToggle);
      events.off(Events.THEME_SET, onSet);
    };
  }, [onToggle, onSet, applyTheme]);

  return null;
}

export { ThemeHandler };
