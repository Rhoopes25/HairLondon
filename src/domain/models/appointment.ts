import type { ServiceId } from './service';
import type { DurationMin, IsoDate, MinuteOfDay } from './time';

/**
 * Only "booked" and "cancelled" are stored. Whether a booked visit is upcoming or
 * already happened depends on the clock, so it is derived (see appointmentPhase).
 */
export type AppointmentStatus = 'booked' | 'cancelled';

export interface Appointment {
  readonly id: string;
  readonly stylistId: string;
  readonly serviceIds: readonly ServiceId[];
  readonly date: IsoDate;
  readonly start: MinuteOfDay;
  readonly durationMin: DurationMin;
  readonly total: number;
  readonly name: string;
  readonly phone: string;
  readonly status: AppointmentStatus;
}

export type AppointmentPhase = 'upcoming' | 'past' | 'cancelled';
