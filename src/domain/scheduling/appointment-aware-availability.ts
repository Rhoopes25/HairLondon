import type { Appointment } from '../models/appointment';
import type { DurationMin, IsoDate, MinuteOfDay } from '../models/time';
import type { AvailabilityStrategy } from './availability';

export type AppointmentsOn = (stylistId: string, date: IsoDate) => readonly Appointment[];

/**
 * Decorator: wraps any availability strategy so a slot the client has booked becomes
 * unavailable, and cancelling or rescheduling frees it again.
 */
export class AppointmentAwareAvailability implements AvailabilityStrategy {
  constructor(
    private readonly base: AvailabilityStrategy,
    private readonly appointmentsOn: AppointmentsOn,
    /** Length of one grid block. */
    private readonly step: DurationMin,
  ) {}

  isBlockBooked(stylistId: string, date: IsoDate, block: MinuteOfDay): boolean {
    if (this.base.isBlockBooked(stylistId, date, block)) return true;
    return this.appointmentsOn(stylistId, date).some(
      (appointment) =>
        appointment.status === 'booked' &&
        block < appointment.start + appointment.durationMin &&
        block + this.step > appointment.start,
    );
  }
}
