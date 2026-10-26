import { JsonStore } from '../storage/json-store';
import type { StorageAdapter } from '../storage/storage-adapter';

/** Before accounts owned them: one list for the whole device. Kept only to hand it over once. */
export const SAVED_KEY = 'hbl:saved:v1';
/** Saved stylists per pretend account: account id -> stylist ids, in the order she saved them. */
export const SAVED_BY_ACCOUNT_KEY = 'hbl:saved:v2';

type SavedByAccount = Readonly<Record<string, readonly string[]>>;

const NONE: readonly string[] = [];

function isIdList(raw: unknown): raw is readonly string[] {
  return Array.isArray(raw) && raw.every((id) => typeof id === 'string');
}

function parseIds(raw: unknown): readonly string[] | null {
  return isIdList(raw) ? raw : null;
}

function parseByAccount(raw: unknown): SavedByAccount | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  return Object.values(raw).every(isIdList) ? (raw as SavedByAccount) : null;
}

/**
 * Stylists she saved to come back to. Saving belongs to her account, like on most sites: a guest
 * has no saved list, and two people sharing a device do not see each other's.
 */
export class SavedStylistRepository {
  private readonly store: JsonStore<SavedByAccount>;
  private readonly deviceStore: JsonStore<readonly string[]>;
  readonly subscribe: JsonStore<SavedByAccount>['subscribe'];
  readonly getSnapshot: JsonStore<SavedByAccount>['getSnapshot'];

  constructor(storage: StorageAdapter) {
    this.store = new JsonStore<SavedByAccount>(storage, SAVED_BY_ACCOUNT_KEY, {}, parseByAccount);
    this.deviceStore = new JsonStore<readonly string[]>(storage, SAVED_KEY, [], parseIds);
    this.subscribe = this.store.subscribe;
    this.getSnapshot = this.store.getSnapshot;
  }

  /** Her saved stylist ids; none for a guest. The same array until it changes. */
  idsFor(accountId: string | null): readonly string[] {
    return accountId ? (this.store.getSnapshot()[accountId] ?? NONE) : NONE;
  }

  isSaved(accountId: string | null, stylistId: string): boolean {
    return this.idsFor(accountId).includes(stylistId);
  }

  toggle(accountId: string, stylistId: string): void {
    const ids = this.idsFor(accountId);
    this.setIds(
      accountId,
      ids.includes(stylistId) ? ids.filter((id) => id !== stylistId) : [...ids, stylistId],
    );
  }

  /** Saves without toggling, for a save she asked for before she had signed in. */
  save(accountId: string, stylistId: string): void {
    const ids = this.idsFor(accountId);
    if (!ids.includes(stylistId)) this.setIds(accountId, [...ids, stylistId]);
  }

  /**
   * Stylists saved on this device before saves belonged to accounts go to the first account that
   * signs in here, once, so nobody loses theirs.
   */
  adoptDeviceSaves(accountId: string): void {
    const device = this.deviceStore.getSnapshot();
    if (!device.length) return;
    const ids = this.idsFor(accountId);
    this.setIds(accountId, [...ids, ...device.filter((id) => !ids.includes(id))]);
    this.deviceStore.set([]);
  }

  private setIds(accountId: string, ids: readonly string[]): void {
    this.store.update((all) => ({ ...all, [accountId]: ids }));
  }
}
