import { describe, expect, it } from 'vitest';
import { MemoryStorageAdapter } from '../storage/memory-storage-adapter';
import {
  SAVED_BY_ACCOUNT_KEY,
  SAVED_KEY,
  SavedStylistRepository,
} from './saved-stylist-repository';

describe('SavedStylistRepository', () => {
  it('keeps a separate list per account, and none for a guest', () => {
    const saved = new SavedStylistRepository(new MemoryStorageAdapter());
    saved.toggle('acc_a', 'london');
    saved.toggle('acc_b', 'kai');
    expect(saved.idsFor('acc_a')).toEqual(['london']);
    expect(saved.idsFor('acc_b')).toEqual(['kai']);
    expect(saved.idsFor(null)).toEqual([]);
    saved.toggle('acc_a', 'london');
    expect(saved.idsFor('acc_a')).toEqual([]);
  });

  it('save() never un-saves', () => {
    const saved = new SavedStylistRepository(new MemoryStorageAdapter());
    saved.save('acc_a', 'london');
    saved.save('acc_a', 'london');
    expect(saved.idsFor('acc_a')).toEqual(['london']);
  });

  it('hands stylists saved on the device before accounts to the first account, once', () => {
    const storage = new MemoryStorageAdapter();
    storage.setItem(SAVED_KEY, JSON.stringify(['london', 'sadie']));
    const saved = new SavedStylistRepository(storage);
    saved.toggle('acc_a', 'sadie');
    saved.adoptDeviceSaves('acc_a');
    expect(saved.idsFor('acc_a')).toEqual(['sadie', 'london']);
    saved.adoptDeviceSaves('acc_b');
    expect(saved.idsFor('acc_b')).toEqual([]);
    expect(storage.getItem(SAVED_KEY)).toBe('[]');
  });

  it('starts empty when what is stored is not valid', () => {
    const storage = new MemoryStorageAdapter();
    storage.setItem(SAVED_BY_ACCOUNT_KEY, JSON.stringify({ acc_a: [1, 2] }));
    expect(new SavedStylistRepository(storage).idsFor('acc_a')).toEqual([]);
  });
});
