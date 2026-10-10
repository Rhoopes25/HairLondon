import type { IsoDate, MinuteOfDay } from '../models/time';
import type { AvailabilityStrategy } from './availability';

/** 32-bit FNV-1a, so the same inputs always give the same sample openings. */
function fnv1a(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** "2026-10-07" -> "2026-10-7". The legacy site hashed this unpadded form; keeping it keeps the same openings. */
function legacyDateKey(date: IsoDate): string {
  const [year = '', month = '', day = ''] = date.split('-');
  return `${year}-${Number(month)}-${Number(day)}`;
}

/**
 * Until there is a real calendar, each stylist gets a steady, made-up set of booked
 * blocks per day. The same day always shows the same openings.
 */
export class SeededAvailability implements AvailabilityStrategy {
  constructor(private readonly bookedPercent = 20) {}

  isBlockBooked(stylistId: string, date: IsoDate, block: MinuteOfDay): boolean {
    return fnv1a(`${stylistId}${legacyDateKey(date)}${block}`) % 100 < this.bookedPercent;
  }
}
