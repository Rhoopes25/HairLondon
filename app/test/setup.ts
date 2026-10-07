import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

/**
 * Newer Node versions ship an experimental global `localStorage` that shadows jsdom's and is
 * missing methods without a backing file. Real browsers are fine; this keeps the tests honest
 * everywhere by swapping in a working in-memory Storage only when the global is unusable.
 */
class MemoryStorage implements Storage {
  private items = new Map<string, string>();

  get length() {
    return this.items.size;
  }
  clear() {
    this.items.clear();
  }
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
  setItem(key: string, value: string) {
    this.items.set(key, String(value));
  }
}

if (typeof window.localStorage?.removeItem !== 'function') {
  Object.defineProperty(window, 'localStorage', { value: new MemoryStorage(), configurable: true });
}

// Routes are code-split, so the first visit to a screen loads a module. Under a loaded machine
// that can take longer than the 1 second default.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  // jsdom does not implement scrolling; ScrollRestoration calls it on navigation.
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.body.style.overflow = '';
});
