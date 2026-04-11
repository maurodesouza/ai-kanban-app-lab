import { Events } from '@/types/events';
import { BaseEventHandle } from './base';
import type { Theme } from '@/types/themes';

export type ThemeTogglePayload = void;

export type ThemeSetPayload = {
  theme: Theme;
};

export type ThemeNextPayload = {
  themes: Theme[];
};

export type ThemeChangedPayload = {
  theme: Theme;
};

class ThemeHandleEvents extends BaseEventHandle {
  toggle() {
    this.emit(Events.THEME_TOGGLE);
  }

  set(payload: ThemeSetPayload) {
    this.emit(Events.THEME_SET, payload);
  }

  next(payload: ThemeNextPayload) {
    this.emit(Events.THEME_NEXT, payload);
  }

  emitChanged(theme: Theme) {
    this.emit(Events.THEME_CHANGED, { theme });
  }
}

export { ThemeHandleEvents };
