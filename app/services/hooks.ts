import { useMemo, useSyncExternalStore } from 'react';
import type { MyLocation } from '@src/data/repositories/location-repository';
import type { Account } from '@src/domain/account/account';
import type { Appointment } from '@src/domain/models/appointment';
import type { Stylist } from '@src/domain/models/stylist';
import { withUserReviews } from '@src/domain/reviews';
import type { SearchEnvironment } from '@src/domain/stylists/book-search';
import { useServices } from './ServicesProvider';

/** Anything with subscribe/getSnapshot (every persisted repository). Observer, bridged to React. */
export interface ExternalStore<T> {
  subscribe(listener: () => void): () => void;
  getSnapshot(): T;
}

export function useStore<T>(store: ExternalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

/** All stylists, each with the reviews the client has written added to her sample ones. */
export function useStylists(): readonly Stylist[] {
  const { stylists, reviews } = useServices();
  const userReviews = useStore(reviews);
  return useMemo(
    () => stylists.list().map((stylist) => withUserReviews(stylist, userReviews)),
    [stylists, userReviews],
  );
}

/** One stylist by id, or null if there is no such stylist. */
export function useStylist(id: string | null | undefined): Stylist | null {
  const all = useStylists();
  return useMemo(() => all.find((stylist) => stylist.id === id) ?? null, [all, id]);
}

export function useAppointments(): readonly Appointment[] {
  return useStore(useServices().appointments);
}

/** One appointment by id, or null. Re-renders when it changes (cancel, reschedule). */
export function useAppointment(id: string | null | undefined): Appointment | null {
  const all = useAppointments();
  return useMemo(() => all.find((appointment) => appointment.id === id) ?? null, [all, id]);
}

/**
 * Everything a search for open times needs: the catalog, the clock, and availability that already
 * counts the visits she booked. The availability looks appointments up when asked, so subscribing
 * here is enough to re-render (and so re-search) the moment she books, moves, or cancels one.
 */
export function useSearchEnvironment(): SearchEnvironment {
  const { catalog, clock, availabilityFor } = useServices();
  useAppointments();
  return { catalog, clock, strategy: availabilityFor() };
}

/** The signed-in account's saved stylist ids; a guest has none. */
export function useSavedIds(): readonly string[] {
  const { saved } = useServices();
  const account = useAccount();
  useStore(saved);
  return saved.idsFor(account?.id ?? null);
}

/** Where she is, if she has shared it (or the sample spot standing in for it). */
export function useMyLocation(): MyLocation | null {
  return useStore(useServices().location);
}

/** The signed-in pretend account, or null for a guest. */
export function useAccount(): Account | null {
  const { accounts } = useServices();
  const state = useStore(accounts);
  return useMemo(
    () => state.accounts.find((account) => account.id === state.currentId) ?? null,
    [state],
  );
}
