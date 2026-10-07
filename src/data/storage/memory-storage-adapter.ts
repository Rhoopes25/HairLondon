import type { StorageAdapter } from './storage-adapter';

/** Keeps data in memory only. Used by tests and as the fallback when browser storage is blocked. */
export class MemoryStorageAdapter implements StorageAdapter {
  private readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }
}
