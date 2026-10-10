import { describe, expect, it } from 'vitest';
import { STYLISTS } from '../../data/seed/stylists';
import { SERVICES } from '../../data/seed/services';
import { fixedClock } from '../clock';
import type { IsoDate } from '../models/time';
import type { AvailabilityStrategy } from '../scheduling/availability';
import { searchableDays, searchStylists, visitLength } from './book-search';
import type { SearchEnvironment } from './book-search';

/** Wed Oct 7, 2026, 8:00 AM. */
const clock = fixedClock(new Date(2026, 9, 7, 8, 0));
const open: AvailabilityStrategy = { isBlockBooked: () => false };
const env = (strategy: AvailabilityStrategy = open): SearchEnvironment => ({
  catalog: SERVICES,
  strategy,
  clock,
});
const ids = (list: readonly { stylist: { id: string } }[]) => list.map((m) => m.stylist.id);

describe('visitLength', () => {
  it('is an hour with nothing chosen, and the services added together otherwise', () => {
    expect(visitLength(SERVICES, [])).toBe(60);
    expect(visitLength(SERVICES, ['haircut', 'highlights'])).toBe(210);
  });
});

describe('searchStylists', () => {
  it('gives every offering stylist up to three openings, soonest first', () => {
    const { matches } = searchStylists(STYLISTS, { serviceIds: [] }, env());
    expect(ids(matches)).toEqual(['london', 'sadie', 'kai', 'brooke']);
    for (const match of matches) {
      expect(match.openings).toHaveLength(3);
      expect(`${match.openings[0]?.date}` <= `${match.openings[2]?.date}`).toBe(true);
    }
  });

  it('leaves out stylists who do not offer every chosen service', () => {
    const { offering } = searchStylists(STYLISTS, { serviceIds: ['highlights'] }, env());
    expect(offering.map((s) => s.id)).toEqual(['london', 'sadie', 'brooke']);
  });

  it('drops a stylist whose day is full for a long visit', () => {
    const day = '2026-10-14' as IsoDate; // a Wednesday: london, sadie, kai and brooke all work it
    const busyLondon: AvailabilityStrategy = {
      isBlockBooked: (stylistId) => stylistId === 'london',
    };
    const { matches } = searchStylists(STYLISTS, { serviceIds: [], day }, env(busyLondon));
    expect(ids(matches)).not.toContain('london');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('puts the soonest opening first once a time of day is chosen', () => {
    const { matches } = searchStylists(
      STYLISTS,
      { serviceIds: [], timeOfDay: 'evening' },
      env(),
    );
    const firsts = matches.map((m) => `${m.openings[0]?.date}${m.openings[0]?.start}`);
    expect([...firsts].sort()).toEqual(firsts);
    expect(matches.every((m) => (m.openings[0]?.start ?? 0) >= 16 * 60)).toBe(true);
  });

  it('offers their soonest times instead when nobody fits the day asked for', () => {
    const sunday = '2026-10-11' as IsoDate; // nobody works Sunday
    const outcome = searchStylists(STYLISTS, { serviceIds: [], day: sunday }, env());
    expect(outcome.matches).toEqual([]);
    expect(outcome.alternatives.length).toBe(4);
  });

  it('has no alternatives when everything is already booked', () => {
    const outcome = searchStylists(
      STYLISTS,
      { serviceIds: ['highlights', 'deep-conditioning', 'haircut'], timeOfDay: 'morning' },
      env({ isBlockBooked: () => true }),
    );
    expect(outcome.matches).toEqual([]);
    expect(outcome.alternatives).toEqual([]);
  });
});

describe('searchableDays', () => {
  it('offers up to two weeks of days someone works, starting today', () => {
    const days = searchableDays(clock, STYLISTS);
    expect(days).toHaveLength(14);
    expect(days[0]).toBe('2026-10-07');
  });
});
