import type { Clock } from '../clock';
import { parseIsoDate } from '../format/date';
import type { Appointment, AppointmentPhase } from '../models/appointment';
import { addDuration } from '../models/time';

export function appointmentEnd(appointment: Pick<Appointment, 'start' | 'durationMin'>) {
  return addDuration(appointment.start, appointment.durationMin);
}

/** Local date and time at which the visit starts. */
export function appointmentStartsAt(appointment: Pick<Appointment, 'date' | 'start'>): Date {
  const day = parseIsoDate(appointment.date);
  day.setMinutes(appointment.start);
  return day;
}

export function appointmentPhase(appointment: Appointment, clock: Clock): AppointmentPhase {
  if (appointment.status === 'cancelled') return 'cancelled';
  return appointmentStartsAt(appointment).getTime() > clock.now().getTime() ? 'upcoming' : 'past';
}

/** Soonest first. */
export function byStartAscending(a: Appointment, b: Appointment): number {
  return appointmentStartsAt(a).getTime() - appointmentStartsAt(b).getTime();
}

/** Most recent first. */
export function byStartDescending(a: Appointment, b: Appointment): number {
  return byStartAscending(b, a);
}

export interface GroupedAppointments {
  readonly upcoming: Appointment[];
  readonly past: Appointment[];
  readonly cancelled: Appointment[];
}

export function groupAppointments(
  appointments: readonly Appointment[],
  clock: Clock,
): GroupedAppointments {
  const grouped: GroupedAppointments = { upcoming: [], past: [], cancelled: [] };
  for (const appointment of appointments) {
    grouped[appointmentPhase(appointment, clock)].push(appointment);
  }
  grouped.upcoming.sort(byStartAscending);
  grouped.past.sort(byStartDescending);
  grouped.cancelled.sort(byStartDescending);
  return grouped;
}
