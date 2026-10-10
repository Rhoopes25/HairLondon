import { JsonStore } from '../storage/json-store';
import type { StorageAdapter } from '../storage/storage-adapter';

export const PREFERENCES_KEY = 'hbl:preferences:v1';

export interface Preferences {
  /** The early-prototype notice has been read and closed. */
  readonly noticeDismissed: boolean;
}

function parsePreferences(raw: unknown): Preferences | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = (raw as Record<string, unknown>).noticeDismissed;
  return typeof value === 'boolean' ? { noticeDismissed: value } : null;
}

export class PreferencesRepository {
  private readonly store: JsonStore<Preferences>;
  readonly subscribe: JsonStore<Preferences>['subscribe'];
  readonly getSnapshot: JsonStore<Preferences>['getSnapshot'];

  constructor(storage: StorageAdapter) {
    this.store = new JsonStore<Preferences>(
      storage,
      PREFERENCES_KEY,
      { noticeDismissed: false },
      parsePreferences,
    );
    this.subscribe = this.store.subscribe;
    this.getSnapshot = this.store.getSnapshot;
  }

  dismissNotice(): void {
    this.store.set({ noticeDismissed: true });
  }
}
