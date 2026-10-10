import { weekdayOf } from '../format/date';
import { asMinuteOfDay, durationMin } from '../models/time';
import type { DurationMin, IsoDate, MinuteOfDay, Weekday } from '../models/time';
import { SALON_HOURS } from './salon-hours';
import { bookableDays, isStartAvailable } from './slots';
import type { SlotContext } from './slots';

/** The three parts of the day a client can narrow a search to. Boundaries are by start time. */
export const TIMES_OF_DAY = {
  morning: { label: 'Morning', from: SALON_HOURS.open, to: asMinuteOfDay(12 * 60) },
  afternoon: { label: 'Afternoon', from: asMinuteOfDay(12 * 60), to: asMinuteOfDay(16 * 60) },
  evening: { label: 'Evening', from: asMinuteOfDay(16 * 60), to: SALON_HOURS.close },
} as const;

export type TimeOfDay = keyof typeof TIMES_OF_DAY;

export const TIME_OF_DAY_IDS = Object.keys(TIMES_OF_DAY) as readonly TimeOfDay[];

export function isTimeOfDay(value: unknown): value is TimeOfDay {
  return typeof value === 'string' && value in TIMES_OF_DAY;
}

/** One open start time for one stylist. */
export interface Opening {
  readonly date: IsoDate;
  readonly start: MinuteOfDay;
}

export interface OpeningSearch {
  /** Look at this one day only. Default: every day she can be booked. */
  readonly day?: IsoDate | undefined;
  readonly timeOfDay?: TimeOfDay | undefined;
  /** Stop after this many. Default: no limit. */
  readonly limit?: number | undefined;
}

/**
 * The soonest times a stylist can fit a visit of this length, in order.
 * A day she does not work, or a visit that cannot fit, simply yields nothing.
 */
export function findOpenings(
  context: SlotContext,
  workDays: readonly Weekday[],
  length: DurationMin,
  search: OpeningSearch = {},
): Opening[] {
  const hours = context.hours ?? SALON_HOURS;
  const needed = durationMin(Math.max(length, hours.step));
  const window = search.timeOfDay ? TIMES_OF_DAY[search.timeOfDay] : null;
  const from = window?.from ?? hours.open;
  const to = window?.to ?? hours.close;

  const days = search.day
    ? workDays.includes(weekdayOf(search.day))
      ? [search.day]
      : []
    : bookableDays(context.clock, workDays, hours);

  const found: Opening[] = [];
  for (const date of days) {
    for (let start: number = from; start < to; start += hours.step) {
      const at = asMinuteOfDay(start);
      if (!isStartAvailable(context, date, at, needed)) continue;
      found.push({ date, start: at });
      if (search.limit !== undefined && found.length >= search.limit) return found;
    }
  }
  return found;
}
