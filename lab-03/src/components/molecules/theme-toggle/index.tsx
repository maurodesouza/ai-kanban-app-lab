'use client';

import { Sun, Moon } from 'lucide-react';
import { ComponentType } from 'react';
import { events } from '@/events';
import { cookie } from '@/utils/cookies';
import { DEFAULT_THEME, THEME_CONFIGS } from '@/utils/themes';
import { Clickable } from '@/components/atoms/clickable';

const THEME_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  dark: Moon,
  light: Sun,
};

function ThemeToggle() {
  const currentTheme = cookie.get('theme') || DEFAULT_THEME;

  const themeConfig = THEME_CONFIGS[currentTheme as keyof typeof THEME_CONFIGS];
  const Icon = THEME_ICONS[currentTheme] || Moon;

  function handleToggle() {
    events.theme.toggle();
  }

  return (
    <Clickable.Button
      onClick={handleToggle}
      title={`Switch from ${themeConfig.displayName} theme`}
    >
      <Icon />
    </Clickable.Button>
  );
}

export { ThemeToggle };
