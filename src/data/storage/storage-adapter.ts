/**
 * Adapter: one small interface over "somewhere to keep strings".
 * src/ has no browser APIs, so the browser's localStorage is wrapped in app/adapters
 * and handed in; tests use MemoryStorageAdapter. A remote store could implement this too.
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
