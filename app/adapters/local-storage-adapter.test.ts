import { describe, expect, it } from 'vitest';
import { LocalStorageAdapter, createBrowserStorage } from './local-storage-adapter';

describe('LocalStorageAdapter', () => {
  it('reads, writes, and removes through the browser Storage', () => {
    window.localStorage.clear();
    const adapter = new LocalStorageAdapter(window.localStorage);
    expect(adapter.getItem('k')).toBeNull();
    adapter.setItem('k', 'v');
    expect(window.localStorage.getItem('k')).toBe('v');
    expect(adapter.getItem('k')).toBe('v');
    adapter.removeItem('k');
    expect(adapter.getItem('k')).toBeNull();
  });
});

describe('createBrowserStorage', () => {
  it('uses localStorage when it works', () => {
    expect(createBrowserStorage(() => window.localStorage)).toBeInstanceOf(LocalStorageAdapter);
  });

  it('falls back to memory when storage is blocked, and still works', () => {
    const blocked = () => {
      throw new Error('SecurityError');
    };
    const storage = createBrowserStorage(blocked);
    storage.setItem('k', 'v');
    expect(storage.getItem('k')).toBe('v');
    expect(storage).not.toBeInstanceOf(LocalStorageAdapter);
  });

  it('falls back to memory when writing throws (quota or private mode)', () => {
    const full = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => undefined,
    } as unknown as Storage;
    expect(createBrowserStorage(() => full)).not.toBeInstanceOf(LocalStorageAdapter);
  });
});
