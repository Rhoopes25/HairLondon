import { formatDay } from '@src/domain/format/date';
import { formatDuration } from '@src/domain/format/duration';
import { formatRange } from '@src/domain/format/time';
import { appointmentEnd } from '@src/domain/booking/appointments';
import type { Appointment } from '@src/domain/models/appointment';
import type { ServiceCatalog } from '@src/domain/models/service';

/** "Haircut + Color" */
export function servicesText(
  appointment: Pick<Appointment, 'serviceIds'>,
  catalog: ServiceCatalog,
): string {
  return appointment.serviceIds.map((id) => catalog[id].name).join(' + ');
}

/** "Fri, Oct 16, 1:00 to 2:00 PM" */
export function whenText(appointment: Pick<Appointment, 'date' | 'start' | 'durationMin'>): string {
  return `${formatDay(appointment.date)}, ${formatRange(appointment.start, appointmentEnd(appointment))}`;
}

/** "$65 · 1 hr" */
export function totalText(appointment: Pick<Appointment, 'total' | 'durationMin'>): string {
  return `$${appointment.total} · ${formatDuration(appointment.durationMin)}`;
}
