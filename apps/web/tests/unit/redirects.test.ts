import { describe, expect, it } from 'vitest';
import { isInternalPath, safeReturnPath } from '../../lib/auth/redirects';

describe('safe auth redirects', () => {
  it('allows internal paths', () => {
    expect(isInternalPath('/player/games')).toBe(true);
    expect(safeReturnPath('/player/profile')).toBe('/player/profile');
  });

  it('rejects open redirect targets', () => {
    expect(isInternalPath('https://evil.example')).toBe(false);
    expect(isInternalPath('//evil.example')).toBe(false);
    expect(safeReturnPath('https://evil.example')).toBe('/player');
  });
});
