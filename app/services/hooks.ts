import { useMemo, useSyncExternalStore } from 'react';
import type { Appointment } from '@src/domain/models/appointment';
import type { Stylist } from '@src/domain/models/stylist';
import { withUserReviews } from '@src/domain/reviews';
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

export function useSavedIds(): readonly string[] {
  return useStore(useServices().saved);
}
