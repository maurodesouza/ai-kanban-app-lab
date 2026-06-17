import { describe, it, expect } from 'vitest';
import { getNextTheme, isValidTheme, AVAILABLE_THEMES } from './index';

describe('themes utility', () => {
  describe('getNextTheme', () => {
    it('should cycle from dark to light', () => {
      expect(getNextTheme('dark')).toBe('light');
    });

    it('should cycle from light to dark', () => {
      expect(getNextTheme('light')).toBe('dark');
    });
  });

  describe('isValidTheme', () => {
    it('should return true for valid themes', () => {
      expect(isValidTheme('dark')).toBe(true);
      expect(isValidTheme('light')).toBe(true);
    });

    it('should return false for invalid themes', () => {
      expect(isValidTheme('invalid')).toBe(false);
      expect(isValidTheme('')).toBe(false);
    });
  });

  describe('AVAILABLE_THEMES', () => {
    it('should contain both dark and light', () => {
      expect(AVAILABLE_THEMES).toEqual(['dark', 'light']);
    });
  });
});
