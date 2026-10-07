import { MemoryStorageAdapter } from '@src/data/storage/memory-storage-adapter';
import type { StorageAdapter } from '@src/data/storage/storage-adapter';

/** Adapter: the browser's Storage (localStorage) behind the StorageAdapter interface that src/ expects. */
export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly storage: Storage) {}

  getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }
}

/**
 * localStorage when it works. Private windows and blocked site data can make it throw,
 * so probe first and fall back to memory: the app still runs, it just forgets on reload.
 */
export function createBrowserStorage(
  storage: () => Storage = () => window.localStorage,
): StorageAdapter {
  try {
    const target = storage();
    const probe = '__hbl_probe__';
    target.setItem(probe, '1');
    target.removeItem(probe);
    return new LocalStorageAdapter(target);
  } catch {
    return new MemoryStorageAdapter();
  }
}
