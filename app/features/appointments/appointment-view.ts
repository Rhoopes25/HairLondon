import { formatDay } from '@src/domain/format/date';
import { formatDuration } from '@src/domain/format/duration';
import { formatStartingPrice } from '@src/domain/format/price';
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

/** "$65+, about 1 hr". The price is a starting price: the stylist confirms the final one. */
export function totalText(appointment: Pick<Appointment, 'total' | 'durationMin'>): string {
  return `${formatStartingPrice(appointment.total)}, about ${formatDuration(appointment.durationMin)}`;
}
