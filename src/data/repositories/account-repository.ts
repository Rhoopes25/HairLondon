import type { Account, NewAccountInput } from '../../domain/account/account';
import { normalizeEmail } from '../../domain/account/account';
import type { Clock } from '../../domain/clock';
import { JsonStore } from '../storage/json-store';
import type { StorageAdapter } from '../storage/storage-adapter';

export const ACCOUNTS_KEY = 'hbl:accounts:v1';

/** Every pretend account made on this device, and which one is signed in. */
export interface AccountsState {
  readonly accounts: readonly Account[];
  readonly currentId: string | null;
}

const EMPTY: AccountsState = { accounts: [], currentId: null };

function isAccount(raw: unknown): raw is Account {
  if (typeof raw !== 'object' || raw === null) return false;
  const a = raw as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.name === 'string' &&
    typeof a.phone === 'string' &&
    typeof a.email === 'string'
  );
}

function parseAccounts(raw: unknown): AccountsState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { accounts, currentId } = raw as Record<string, unknown>;
  if (!Array.isArray(accounts) || !accounts.every(isAccount)) return null;
  const current = typeof currentId === 'string' && accounts.some((a) => a.id === currentId);
  return { accounts, currentId: current ? currentId : null };
}

export type CreateResult =
  | { readonly ok: true; readonly account: Account }
  | { readonly ok: false; readonly reason: 'email-taken' };

/**
 * Pretend sign-in for the prototype: accounts live in this browser only, there are no passwords,
 * and nothing leaves the device. Enough to test whether saving her details makes booking calmer.
 */
export class AccountRepository {
  private readonly store: JsonStore<AccountsState>;
  readonly subscribe: JsonStore<AccountsState>['subscribe'];
  readonly getSnapshot: JsonStore<AccountsState>['getSnapshot'];

  constructor(
    storage: StorageAdapter,
    private readonly clock: Clock,
  ) {
    this.store = new JsonStore<AccountsState>(storage, ACCOUNTS_KEY, EMPTY, parseAccounts);
    this.subscribe = this.store.subscribe;
    this.getSnapshot = this.store.getSnapshot;
  }

  current(): Account | null {
    const { accounts, currentId } = this.store.getSnapshot();
    return accounts.find((account) => account.id === currentId) ?? null;
  }

  /** Makes the account and signs her in. One account per email. */
  create(input: NewAccountInput): CreateResult {
    const email = normalizeEmail(input.email);
    if (this.findByEmail(email)) return { ok: false, reason: 'email-taken' };
    const account: Account = {
      ...input,
      email,
      id: `acct_${this.clock.now().getTime().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    };
    this.store.update((state) => ({
      accounts: [...state.accounts, account],
      currentId: account.id,
    }));
    return { ok: true, account };
  }

  /** Signs in by email. Returns null when no account on this device has it. */
  signIn(email: string): Account | null {
    const account = this.findByEmail(normalizeEmail(email));
    if (!account) return null;
    this.store.update((state) => ({ ...state, currentId: account.id }));
    return account;
  }

  signOut(): void {
    this.store.update((state) => ({ ...state, currentId: null }));
  }

  private findByEmail(email: string): Account | undefined {
    return this.store.getSnapshot().accounts.find((account) => account.email === email);
  }
}
