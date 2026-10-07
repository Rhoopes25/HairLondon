import type { MinuteOfDay } from '../models/time';

const NOON = 12 * 60;

/** 810 -> "1:30 PM", or "1:30" when the period is omitted. */
export function formatTime(mins: number, withPeriod = true): string {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h24 % 12 || 12;
  const period = h24 < 12 ? 'AM' : 'PM';
  return `${h12}:${String(m).padStart(2, '0')}${withPeriod ? ` ${period}` : ''}`;
}

/** "1:00 to 2:30 PM", or "11:00 AM to 12:30 PM" when the range crosses noon. */
export function formatRange(start: MinuteOfDay | number, end: MinuteOfDay | number): string {
  const startsInMorning = start < NOON;
  const endsInMorning = end < NOON;
  const samePeriod = startsInMorning === endsInMorning;
  return `${formatTime(start, !samePeriod)} to ${formatTime(end)}`;
}
