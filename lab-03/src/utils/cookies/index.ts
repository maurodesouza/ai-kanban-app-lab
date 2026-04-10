/**
 * Generic cookie utility functions for the kanban app
 */

const COOKIE_PREFIX = '@kanban-app:';

function getCookieName(key: string): string {
  return `${COOKIE_PREFIX}${key}`;
}

function getCookie(key: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  const cookieName = getCookieName(key);
  const cookie = cookies.find(c => c.trim().startsWith(`${cookieName}=`));

  if (!cookie) {
    return null;
  }

  return cookie.split('=')[1]?.trim() || null;
}

function setCookie(
  key: string,
  value: string,
  options: {
    expires?: Date;
    path?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
  } = {}
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const {
    expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    path = '/',
    sameSite = 'Lax',
  } = options;

  const cookieName = getCookieName(key);
  const cookieString = `${cookieName}=${value}; expires=${expires.toUTCString()}; path=${path}; SameSite=${sameSite}`;

  document.cookie = cookieString;
}

function removeCookie(
  key: string,
  options: {
    path?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
  } = {}
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const { path = '/', sameSite = 'Lax' } = options;

  const cookieName = getCookieName(key);
  const cookieString = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=${sameSite}`;

  document.cookie = cookieString;
}

function hasCookie(key: string): boolean {
  return getCookie(key) !== null;
}

export const cookie = {
  get: getCookie,
  set: setCookie,
  remove: removeCookie,
  has: hasCookie,
};
