import { parseIsoDate } from '../format/date';
import type { Appointment } from '../models/appointment';
import type { ServiceCatalog } from '../models/service';
import type { Stylist } from '../models/stylist';
import { firstName } from '../format/name';
import { appointmentEnd } from '../booking/appointments';
import type { IsoDate, MinuteOfDay } from '../models/time';

const pad = (n: number) => String(n).padStart(2, '0');

/** Floating local time, e.g. 20261016T130000. */
export function icsLocalStamp(date: IsoDate, minutes: MinuteOfDay | number): string {
  const day = parseIsoDate(date);
  day.setMinutes(minutes);
  return (
    `${day.getFullYear()}${pad(day.getMonth() + 1)}${pad(day.getDate())}` +
    `T${pad(day.getHours())}${pad(day.getMinutes())}00`
  );
}

function icsUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/** RFC 5545 text escaping. */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export interface IcsInput {
  readonly appointment: Appointment;
  readonly stylist: Pick<Stylist, 'name' | 'studio' | 'city'>;
  readonly catalog: ServiceCatalog;
  /** When the file was created (DTSTAMP). Passed in so the output is deterministic. */
  readonly stamp: Date;
}

/** A single-event iCalendar file the client can add to any calendar app. */
export function buildIcs({ appointment, stylist, catalog, stamp }: IcsInput): string {
  const services = appointment.serviceIds.map((id) => catalog[id].name).join(' + ');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hair by London//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@hairbylondon`,
    `DTSTAMP:${icsUtcStamp(stamp)}`,
    `DTSTART:${icsLocalStamp(appointment.date, appointment.start)}`,
    `DTEND:${icsLocalStamp(appointment.date, appointmentEnd(appointment))}`,
    `SUMMARY:${escapeText(`${services} with ${firstName(stylist.name)}`)}`,
    `LOCATION:${escapeText(`${stylist.studio}, ${stylist.city}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
