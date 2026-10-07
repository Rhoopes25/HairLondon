import { durationMin, minuteOfDay } from '../models/time';
import type { DurationMin, MinuteOfDay } from '../models/time';

export interface SalonHours {
  readonly open: MinuteOfDay;
  readonly close: MinuteOfDay;
  /** Appointments start on this grid. */
  readonly step: DurationMin;
  /** How many days ahead a client can book, counting today. */
  readonly daysAhead: number;
  /** A start time today must be at least this far from now. */
  readonly leadTime: DurationMin;
}

export const SALON_HOURS: SalonHours = {
  open: minuteOfDay(9),
  close: minuteOfDay(18),
  step: durationMin(30),
  daysAhead: 21,
  leadTime: durationMin(60),
};
