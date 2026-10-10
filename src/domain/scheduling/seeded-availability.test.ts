import { describe, expect, it } from 'vitest';
import { asMinuteOfDay } from '../models/time';
import type { IsoDate } from '../models/time';
import { SeededAvailability } from './seeded-availability';

/**
 * Golden vectors computed with the static site's own hash (data.js on main: padded date key,
 * 10% of blocks booked), so the React app shows the same openings the teammates' pages did.
 */
const SAMPLE_BOOKED: { stylist: string; date: string; booked: number[] }[] = [
  { stylist: 'london', date: '2026-10-07', booked: [750, 780, 900, 1080] },
  { stylist: 'london', date: '2026-10-08', booked: [630, 870] },
  { stylist: 'sadie', date: '2026-11-03', booked: [690, 780, 990] },
  { stylist: 'kai', date: '2026-01-15', booked: [870] },
  { stylist: 'brooke', date: '2026-12-25', booked: [630, 780, 1080] },
];

describe('SeededAvailability', () => {
  const availability = new SeededAvailability();

  it.each(SAMPLE_BOOKED)(
    'matches the static site for $stylist on $date',
    ({ stylist, date, booked }) => {
      const actual: number[] = [];
      for (let block = 9 * 60; block < 19 * 60; block += 30) {
        if (availability.isBlockBooked(stylist, date as IsoDate, asMinuteOfDay(block)))
          actual.push(block);
      }
      expect(actual).toEqual(booked);
    },
  );

  it('is stable: asking twice gives the same answer', () => {
    const date = '2026-10-07' as IsoDate;
    const first = availability.isBlockBooked('london', date, asMinuteOfDay(750));
    expect(availability.isBlockBooked('london', date, asMinuteOfDay(750))).toBe(first);
  });

  it('books nothing at 0% and everything at 100%', () => {
    const date = '2026-10-07' as IsoDate;
    const block = asMinuteOfDay(600);
    expect(new SeededAvailability(0).isBlockBooked('london', date, block)).toBe(false);
    expect(new SeededAvailability(100).isBlockBooked('london', date, block)).toBe(true);
  });
});
