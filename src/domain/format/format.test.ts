import { describe, expect, it } from 'vitest';
import { addDays, dayParts, formatDay, parseIsoDate, toIsoDate, weekdayOf } from './date';
import { formatDuration } from './duration';
import { firstName, initials, reviewerName } from './name';
import { formatPhone, isValidPhone, phoneDigits } from './phone';
import { formatPrice, formatPriceRange } from './price';
import { averageRating, formatRating, reviewCountLabel, starsText } from './rating';
import { formatRange, formatTime } from './time';
import type { IsoDate } from '../models/time';

describe('formatTime', () => {
  it.each([
    [0, '12:00 AM'],
    [540, '9:00 AM'],
    [720, '12:00 PM'],
    [810, '1:30 PM'],
    [1050, '5:30 PM'],
  ])('formats %i minutes as %s', (mins, expected) => {
    expect(formatTime(mins)).toBe(expected);
  });

  it('can omit the period', () => {
    expect(formatTime(780, false)).toBe('1:00');
  });
});

describe('formatRange', () => {
  it('shows the period once when both ends share it', () => {
    expect(formatRange(780, 870)).toBe('1:00 to 2:30 PM');
  });

  it('shows both periods when the range crosses noon', () => {
    expect(formatRange(660, 750)).toBe('11:00 AM to 12:30 PM');
  });
});

describe('formatDuration', () => {
  it.each([
    [30, '30 min'],
    [45, '45 min'],
    [60, '1 hr'],
    [90, '1 hr 30 min'],
    [150, '2 hr 30 min'],
  ])('formats %i as %s', (mins, expected) => {
    expect(formatDuration(mins)).toBe(expected);
  });
});

describe('dates', () => {
  const iso = '2026-10-07' as IsoDate;

  it('round-trips an ISO date through a local Date', () => {
    expect(toIsoDate(parseIsoDate(iso))).toBe(iso);
  });

  it('pads month and day', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('knows the weekday', () => {
    expect(weekdayOf(iso)).toBe(3); // Wednesday
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays(iso, 30)).toBe('2026-11-06');
    expect(addDays('2026-12-30' as IsoDate, 3)).toBe('2027-01-02');
    expect(addDays(iso, -14)).toBe('2026-09-23');
  });

  it('formats like the legacy booking page', () => {
    expect(formatDay(iso)).toBe('Wed, Oct 7');
    expect(dayParts(iso)).toEqual({ weekday: 'Wed', dayNum: 7, month: 'Oct' });
  });
});

describe('phone', () => {
  it('keeps digits and drops a leading country code', () => {
    expect(phoneDigits('(555) 123-4567')).toBe('5551234567');
    expect(phoneDigits('+1 555 123 4567')).toBe('5551234567');
  });

  it('validates ten digits', () => {
    expect(isValidPhone('555-123-4567')).toBe(true);
    expect(isValidPhone('555-1234')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });

  it('formats for display', () => {
    expect(formatPhone('5551234567')).toBe('(555) 123-4567');
  });
});

describe('rating', () => {
  it('averages stars and is null with no reviews', () => {
    expect(averageRating([])).toBeNull();
    expect(averageRating([{ stars: 5 }, { stars: 5 }, { stars: 4 }])).toBeCloseTo(4.667, 3);
  });

  it('formats the average to one decimal', () => {
    expect(formatRating(14 / 3)).toBe('4.7');
  });

  it('pluralizes review counts', () => {
    expect(reviewCountLabel(1)).toBe('1 review');
    expect(reviewCountLabel(3)).toBe('3 reviews');
  });

  it('draws filled and empty stars', () => {
    expect(starsText(4)).toBe('★★★★☆');
    expect(starsText(4.667)).toBe('★★★★★');
  });
});

describe('names and prices', () => {
  it('takes initials from the first two words', () => {
    expect(initials('Sadie Morgan')).toBe('SM');
    expect(initials('London')).toBe('L');
    expect(initials('Mary Jane Watson')).toBe('MJ');
  });

  it('takes a first name', () => {
    expect(firstName('Sadie Morgan')).toBe('Sadie');
    expect(firstName('London')).toBe('London');
  });

  it('shortens a reviewer to first name and last initial', () => {
    expect(reviewerName('Maren Thompson')).toBe('Maren T.');
    expect(reviewerName('  maren   lee  ')).toBe('maren L.');
    expect(reviewerName('Maren')).toBe('Maren');
  });

  it('formats prices and ranges', () => {
    expect(formatPrice(65)).toBe('$65');
    expect(formatPriceRange(45, 45)).toBe('$45');
    expect(formatPriceRange(35, 45)).toBe('$35–45');
  });
});
