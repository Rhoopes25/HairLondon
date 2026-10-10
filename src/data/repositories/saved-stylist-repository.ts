import { JsonStore } from '../storage/json-store';
import type { StorageAdapter } from '../storage/storage-adapter';

export const SAVED_KEY = 'hbl:saved:v1';

function parseIds(raw: unknown): readonly string[] | null {
  return Array.isArray(raw) && raw.every((id) => typeof id === 'string') ? raw : null;
}

/** Ids of the stylists the client saved to come back to. */
export class SavedStylistRepository {
  private readonly store: JsonStore<readonly string[]>;
  readonly subscribe: JsonStore<readonly string[]>['subscribe'];
  readonly getSnapshot: JsonStore<readonly string[]>['getSnapshot'];

  constructor(storage: StorageAdapter) {
    this.store = new JsonStore<readonly string[]>(storage, SAVED_KEY, [], parseIds);
    this.subscribe = this.store.subscribe;
    this.getSnapshot = this.store.getSnapshot;
  }

  isSaved(stylistId: string): boolean {
    return this.store.getSnapshot().includes(stylistId);
  }

  toggle(stylistId: string): void {
    this.store.update((ids) =>
      ids.includes(stylistId) ? ids.filter((id) => id !== stylistId) : [...ids, stylistId],
    );
  }
}
