import { describe, expect, it } from 'vitest';
import { asMinuteOfDay } from '@src/domain/models/time';
import type { IsoDate } from '@src/domain/models/time';
import {
  bookingPath,
  profilePath,
  readDate,
  readServiceIds,
  readStart,
  safeBackPath,
} from './links';

const day = '2026-10-14' as IsoDate;

describe('safeBackPath', () => {
  it('keeps a path inside the app', () => {
    expect(safeBackPath('/book?services=color', '/stylists')).toBe('/book?services=color');
  });

  it('falls back for anything that could leave the app', () => {
    expect(safeBackPath(null, '/stylists')).toBe('/stylists');
    expect(safeBackPath('https://example.com', '/stylists')).toBe('/stylists');
    expect(safeBackPath('//example.com', '/stylists')).toBe('/stylists');
  });
});

describe('bookingPath', () => {
  it('is just the stylist when nothing is chosen', () => {
    expect(bookingPath({ stylistId: 'london' })).toBe('/book/london');
  });

  it('carries services, a held day and time, and the way back', () => {
    const path = bookingPath({
      stylistId: 'sadie',
      serviceIds: ['haircut', 'color'],
      date: day,
      start: asMinuteOfDay(780),
      back: '/book?services=haircut,color',
    });
    const [pathname, query = ''] = path.split('?');
    const params = new URLSearchParams(query);
    expect(pathname).toBe('/book/sadie');
    expect(params.get('services')).toBe('haircut,color');
    expect(params.get('date')).toBe(day);
    expect(params.get('start')).toBe('780');
    expect(params.get('back')).toBe('/book?services=haircut,color');
    expect(path).toContain('services=haircut,color');
  });

  it('keeps a start time of midnight', () => {
    expect(bookingPath({ stylistId: 'london', start: asMinuteOfDay(0) })).toBe(
      '/book/london?start=0',
    );
  });
});

describe('profilePath', () => {
  it('goes to a tab with what she chose', () => {
    expect(profilePath({ stylistId: 'kai', tab: 'services', serviceIds: ['blowout'] })).toBe(
      '/stylists/kai/services?services=blowout',
    );
    expect(profilePath({ stylistId: 'kai' })).toBe('/stylists/kai');
  });
});

describe('reading a link', () => {
  it('reads services from the list, or the older single value', () => {
    expect(readServiceIds(new URLSearchParams('services=color,haircut'))).toEqual([
      'color',
      'haircut',
    ]);
    expect(readServiceIds(new URLSearchParams('service=color'))).toEqual(['color']);
    expect(readServiceIds(new URLSearchParams('services=nope'))).toEqual([]);
  });

  it('reads a date and a start time, and rejects nonsense', () => {
    expect(readDate(new URLSearchParams(`date=${day}`))).toBe(day);
    expect(readDate(new URLSearchParams('date=tomorrow'))).toBeNull();
    expect(readStart(new URLSearchParams('start=780'))).toBe(780);
    expect(readStart(new URLSearchParams('start=-5'))).toBeNull();
    expect(readStart(new URLSearchParams('start=abc'))).toBeNull();
    expect(readStart(new URLSearchParams('start='))).toBeNull();
    expect(readStart(new URLSearchParams('start=2000'))).toBeNull();
  });
});
