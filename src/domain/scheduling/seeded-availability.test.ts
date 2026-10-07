import { describe, expect, it } from 'vitest';
import { asMinuteOfDay } from '../models/time';
import type { IsoDate } from '../models/time';
import { SeededAvailability } from './seeded-availability';

/**
 * Golden vectors computed with the legacy site's own hash (booking.html), so the
 * refactor shows the same openings the old pages did.
 */
const LEGACY_BOOKED: { stylist: string; date: string; booked: number[] }[] = [
  { stylist: 'london', date: '2026-10-07', booked: [750, 840, 1050] },
  { stylist: 'london', date: '2026-10-08', booked: [600, 630, 930, 1020] },
  { stylist: 'sadie', date: '2026-11-03', booked: [960] },
  { stylist: 'kai', date: '2026-01-15', booked: [630, 870, 930] },
  { stylist: 'brooke', date: '2026-12-25', booked: [630, 780] },
];

describe('SeededAvailability', () => {
  const availability = new SeededAvailability();

  it.each(LEGACY_BOOKED)(
    'matches the legacy site for $stylist on $date',
    ({ stylist, date, booked }) => {
      const actual: number[] = [];
      for (let block = 9 * 60; block < 18 * 60; block += 30) {
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
