import type { Clock } from '../../domain/clock';
import type { Appointment } from '../../domain/models/appointment';
import { isServiceId } from '../../domain/models/service';
import type { ServiceId } from '../../domain/models/service';
import { isIsoDate } from '../../domain/models/time';
import type { DurationMin, IsoDate, MinuteOfDay } from '../../domain/models/time';
import { JsonStore } from '../storage/json-store';
import type { StorageAdapter } from '../storage/storage-adapter';

export const APPOINTMENTS_KEY = 'hbl:appointments:v1';

export interface NewAppointment {
  readonly stylistId: string;
  readonly serviceIds: readonly ServiceId[];
  readonly date: IsoDate;
  readonly start: MinuteOfDay;
  readonly durationMin: DurationMin;
  readonly total: number;
  readonly name: string;
  readonly phone: string;
}

function isAppointment(raw: unknown): raw is Appointment {
  if (typeof raw !== 'object' || raw === null) return false;
  const a = raw as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.stylistId === 'string' &&
    Array.isArray(a.serviceIds) &&
    a.serviceIds.every(isServiceId) &&
    isIsoDate(a.date) &&
    typeof a.start === 'number' &&
    typeof a.durationMin === 'number' &&
    typeof a.total === 'number' &&
    typeof a.name === 'string' &&
    typeof a.phone === 'string' &&
    (a.status === 'booked' || a.status === 'cancelled')
  );
}

function parseAppointments(raw: unknown): readonly Appointment[] | null {
  return Array.isArray(raw) && raw.every(isAppointment) ? raw : null;
}

/** The client's appointments, kept in a StorageAdapter. React reads it through subscribe/getSnapshot. */
export class AppointmentRepository {
  private readonly store: JsonStore<readonly Appointment[]>;
  readonly subscribe: JsonStore<readonly Appointment[]>['subscribe'];
  readonly getSnapshot: JsonStore<readonly Appointment[]>['getSnapshot'];

  /** `initial` is stored on first run only (e.g. one sample past visit so the history screens have content). */
  constructor(
    storage: StorageAdapter,
    private readonly clock: Clock,
    initial: readonly Appointment[] = [],
  ) {
    const firstRun = storage.getItem(APPOINTMENTS_KEY) === null;
    this.store = new JsonStore(storage, APPOINTMENTS_KEY, initial, parseAppointments);
    if (firstRun && initial.length) this.store.set(initial);
    this.subscribe = this.store.subscribe;
    this.getSnapshot = this.store.getSnapshot;
  }

  list(): readonly Appointment[] {
    return this.store.getSnapshot();
  }

  get(id: string | null | undefined): Appointment | null {
    return this.list().find((appointment) => appointment.id === id) ?? null;
  }

  /** Every appointment (booked or cancelled) a stylist has on a day. */
  listOn(stylistId: string, date: IsoDate): readonly Appointment[] {
    return this.list().filter((a) => a.stylistId === stylistId && a.date === date);
  }

  add(input: NewAppointment): Appointment {
    const appointment: Appointment = {
      ...input,
      id: `apt_${this.clock.now().getTime().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      status: 'booked',
    };
    this.store.update((all) => [...all, appointment]);
    return appointment;
  }

  cancel(id: string): void {
    this.store.update((all) =>
      all.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a)),
    );
  }

  reschedule(id: string, date: IsoDate, start: MinuteOfDay): void {
    this.store.update((all) => all.map((a) => (a.id === id ? { ...a, date, start } : a)));
  }
}
