import { describe, expect, it } from 'vitest';
import { fixedClock } from '../../domain/clock';
import { MemoryStorageAdapter } from '../storage/memory-storage-adapter';
import { AccountRepository } from './account-repository';

const clock = fixedClock(new Date(2026, 9, 7, 8, 0));
const input = { name: 'Rachel', phone: '(801) 555-0142', email: 'rachel@example.com' };

describe('AccountRepository', () => {
  it('creates an account and signs her in, and remembers it on the next visit', () => {
    const storage = new MemoryStorageAdapter();
    const accounts = new AccountRepository(storage, clock);
    const result = accounts.create(input);
    expect(result.ok).toBe(true);
    expect(accounts.current()?.name).toBe('Rachel');
    expect(new AccountRepository(storage, clock).current()?.email).toBe('rachel@example.com');
  });

  it('allows one account per email, ignoring case', () => {
    const accounts = new AccountRepository(new MemoryStorageAdapter(), clock);
    accounts.create(input);
    expect(accounts.create({ ...input, email: ' RACHEL@example.com ' })).toEqual({
      ok: false,
      reason: 'email-taken',
    });
  });

  it('signs out, and back in by email; an unknown email signs no one in', () => {
    const accounts = new AccountRepository(new MemoryStorageAdapter(), clock);
    accounts.create(input);
    accounts.signOut();
    expect(accounts.current()).toBeNull();
    expect(accounts.signIn('nobody@example.com')).toBeNull();
    expect(accounts.signIn('Rachel@Example.com')?.name).toBe('Rachel');
  });

  it('starts empty when what is stored is not valid', () => {
    const storage = new MemoryStorageAdapter();
    storage.setItem('hbl:accounts:v1', '{"accounts":[{"id":1}]}');
    expect(new AccountRepository(storage, clock).current()).toBeNull();
  });
});
