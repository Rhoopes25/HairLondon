import type { Clock } from '../../domain/clock';
import { addDays, toIsoDate } from '../../domain/format/date';
import type { Appointment } from '../../domain/models/appointment';
import { durationMin, minuteOfDay } from '../../domain/models/time';

/**
 * One sample past visit, stored on first run, so the appointment history and
 * "leave a review" screens have something real to show a first-time visitor.
 */
export function seedAppointments(clock: Clock): readonly Appointment[] {
  return [
    {
      id: 'apt_sample_past',
      stylistId: 'london',
      serviceIds: ['haircut'],
      date: addDays(toIsoDate(clock.now()), -14),
      start: minuteOfDay(10),
      durationMin: durationMin(60),
      total: 65,
      name: 'Sample Client',
      phone: '(555) 010-0100',
      status: 'booked',
    },
  ];
}
