import type { IsoDate, Weekday } from '../models/time';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

/** Uses the local calendar day, so a booking made at 11 PM stays on that day. */
export function toIsoDate(date: Date): IsoDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` as IsoDate;
}

export function parseIsoDate(iso: IsoDate): Date {
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function weekdayOf(iso: IsoDate): Weekday {
  return parseIsoDate(iso).getDay() as Weekday;
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export interface DayParts {
  readonly weekday: string;
  readonly dayNum: number;
  readonly month: string;
}

export function dayParts(iso: IsoDate): DayParts {
  const date = parseIsoDate(iso);
  return {
    weekday: WEEKDAYS[date.getDay()] ?? '',
    dayNum: date.getDate(),
    month: MONTHS[date.getMonth()] ?? '',
  };
}

/** "Thu, Oct 16" */
export function formatDay(iso: IsoDate): string {
  const { weekday, dayNum, month } = dayParts(iso);
  return `${weekday}, ${month} ${dayNum}`;
}
