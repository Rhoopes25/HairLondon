import type { Clock } from '../clock';
import { addDays, toIsoDate, weekdayOf } from '../format/date';
import { asMinuteOfDay, durationMin } from '../models/time';
import type { DurationMin, IsoDate, MinuteOfDay, Weekday } from '../models/time';
import type { AvailabilityStrategy } from './availability';
import { SALON_HOURS } from './salon-hours';
import type { SalonHours } from './salon-hours';

export interface SlotContext {
  readonly strategy: AvailabilityStrategy;
  readonly clock: Clock;
  readonly stylistId: string;
  readonly hours?: SalonHours;
}

export interface Slot {
  readonly start: MinuteOfDay;
  readonly available: boolean;
}

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Can a visit of this length start at `start` on `date`? */
export function isStartAvailable(
  context: SlotContext,
  date: IsoDate,
  start: MinuteOfDay,
  length: DurationMin,
): boolean {
  const hours = context.hours ?? SALON_HOURS;
  if (start + length > hours.close) return false;

  const now = context.clock.now();
  if (date === toIsoDate(now) && start <= minutesSinceMidnight(now) + hours.leadTime) return false;

  for (let block: number = start; block < start + length; block += hours.step) {
    if (context.strategy.isBlockBooked(context.stylistId, date, asMinuteOfDay(block))) return false;
  }
  return true;
}

/** Every start time on the grid for one day, marked open or not. */
export function listSlots(context: SlotContext, date: IsoDate, length: DurationMin): Slot[] {
  const hours = context.hours ?? SALON_HOURS;
  // With no service chosen yet, show openings for the shortest possible visit.
  const needed = durationMin(Math.max(length, hours.step));
  const slots: Slot[] = [];
  for (let start: number = hours.open; start < hours.close; start += hours.step) {
    const at = asMinuteOfDay(start);
    slots.push({ start: at, available: isStartAvailable(context, date, at, needed) });
  }
  return slots;
}

/** Days a client can book with a stylist: today onward, only the days she works. */
export function bookableDays(
  clock: Clock,
  workDays: readonly Weekday[],
  hours: SalonHours = SALON_HOURS,
): IsoDate[] {
  const today = toIsoDate(clock.now());
  const days: IsoDate[] = [];
  for (let offset = 0; offset < hours.daysAhead; offset++) {
    const day = addDays(today, offset);
    if (workDays.includes(weekdayOf(day))) days.push(day);
  }
  return days;
}
