import type { GeoPoint } from '../../domain/stylists/location';
import { JsonStore } from '../storage/json-store';
import type { StorageAdapter } from '../storage/storage-adapter';

export const LOCATION_KEY = 'hbl:location:v1';

/**
 * Where she is, once she has tapped "Use my location". `sample` means she was too far from every
 * stylist (or her device would not say), so the prototype stands in a sample spot instead and
 * says so on screen.
 */
export interface MyLocation extends GeoPoint {
  readonly source: 'device' | 'sample';
}

function parseLocation(raw: unknown): MyLocation | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { lat, lng, source } = raw as Record<string, unknown>;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  if (source !== 'device' && source !== 'sample') return null;
  return { lat, lng, source };
}

/** Kept only in this browser, and forgotten with one tap. */
export class LocationRepository {
  private readonly store: JsonStore<MyLocation | null>;
  readonly subscribe: JsonStore<MyLocation | null>['subscribe'];
  readonly getSnapshot: JsonStore<MyLocation | null>['getSnapshot'];

  constructor(storage: StorageAdapter) {
    this.store = new JsonStore<MyLocation | null>(storage, LOCATION_KEY, null, parseLocation);
    this.subscribe = this.store.subscribe;
    this.getSnapshot = this.store.getSnapshot;
  }

  set(location: MyLocation): void {
    this.store.set(location);
  }

  forget(): void {
    this.store.set(null);
  }
}
