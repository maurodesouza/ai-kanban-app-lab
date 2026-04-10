import { Events } from '@/types/events';
import { BaseEventHandle } from './base';
import type { Theme } from '@/utils/themes';

export type ThemeTogglePayload = void;

export type ThemeSetPayload = {
  theme: Theme;
};

export type ThemeNextPayload = {
  themes: Theme[];
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
}

export { ThemeHandleEvents };
