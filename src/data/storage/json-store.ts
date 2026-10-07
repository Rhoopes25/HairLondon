import type { StorageAdapter } from './storage-adapter';

export type Listener = () => void;

/**
 * Observer: a JSON value kept in a StorageAdapter that tells subscribers when it changes.
 * `getSnapshot` returns the same object until the value changes, which is what React's
 * useSyncExternalStore requires. Corrupt or blocked storage never breaks the app: it falls
 * back to the initial value and keeps working in memory.
 */
export class JsonStore<T> {
  private value: T;
  private readonly listeners = new Set<Listener>();

  constructor(
    private readonly storage: StorageAdapter,
    private readonly key: string,
    initial: T,
    /** Returns the value if `raw` has the right shape, otherwise null. */
    private readonly parse: (raw: unknown) => T | null,
  ) {
    this.value = this.load(initial);
  }

  private load(initial: T): T {
    try {
      const text = this.storage.getItem(this.key);
      if (text === null) return initial;
      return this.parse(JSON.parse(text)) ?? initial;
    } catch {
      return initial;
    }
  }

  /** Arrow properties so they can be passed straight to useSyncExternalStore. */
  getSnapshot = (): T => this.value;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  set(next: T): void {
    this.value = next;
    try {
      this.storage.setItem(this.key, JSON.stringify(next));
    } catch {
      // Storage may be full or blocked (private mode). The value still lives in memory.
    }
    this.listeners.forEach((listener) => listener());
  }

  update(change: (current: T) => T): void {
    this.set(change(this.value));
  }
}
