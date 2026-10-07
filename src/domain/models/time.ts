/**
 * Small branded types so a start time can never be passed where a length of time
 * is expected (both are "minutes", which a bare number cannot tell apart).
 */

declare const minuteOfDayBrand: unique symbol;
declare const durationBrand: unique symbol;
declare const isoDateBrand: unique symbol;

/** Minutes after midnight, e.g. 13:30 is 810. */
export type MinuteOfDay = number & { readonly [minuteOfDayBrand]: true };

/** A length of time in minutes. */
export type DurationMin = number & { readonly [durationBrand]: true };

/** A calendar day in the salon's local time, formatted yyyy-mm-dd. */
export type IsoDate = string & { readonly [isoDateBrand]: true };

/** 0 = Sunday ... 6 = Saturday, matching JavaScript's Date.getDay(). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function minuteOfDay(hours: number, minutes = 0): MinuteOfDay {
  return (hours * 60 + minutes) as MinuteOfDay;
}

export function asMinuteOfDay(minutes: number): MinuteOfDay {
  return minutes as MinuteOfDay;
}

export function durationMin(minutes: number): DurationMin {
  return minutes as DurationMin;
}

export function addDuration(start: MinuteOfDay, length: DurationMin): MinuteOfDay {
  return (start + length) as MinuteOfDay;
}

export function sumDurations(lengths: readonly DurationMin[]): DurationMin {
  return lengths.reduce((total, length) => total + length, 0) as DurationMin;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is IsoDate {
  return typeof value === 'string' && ISO_DATE.test(value);
}
