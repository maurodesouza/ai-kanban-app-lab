import { describe, it, expect } from 'vitest';
import { randomId } from './index';

describe('randomId', () => {
  it('should generate a string of default length (12)', () => {
    const id = randomId();
    expect(id).toHaveLength(12);
  });

  it('should generate a string of specified length', () => {
    const id = randomId(20);
    expect(id).toHaveLength(20);
  });

  it('should only contain alphanumeric characters', () => {
    const id = randomId();
    expect(id).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('should generate different IDs on consecutive calls', () => {
    const id1 = randomId();
    const id2 = randomId();
    expect(id1).not.toBe(id2);
  });
});
