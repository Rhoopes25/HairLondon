import { describe, expect, it } from 'vitest';
import { STYLISTS } from '../../data/seed/stylists';
import { describeWorkDays, filterStylists, parseWeekday } from './filter';

const ids = (list: readonly { id: string }[]) => list.map((s) => s.id);

describe('filterStylists', () => {
  it('returns everyone with no filter', () => {
    expect(ids(filterStylists(STYLISTS, {}))).toEqual(['london', 'sadie', 'kai', 'brooke']);
  });

  it('filters by service', () => {
    expect(ids(filterStylists(STYLISTS, { service: 'highlights' }))).toEqual([
      'london',
      'sadie',
      'brooke',
    ]);
  });

  it('filters by the day of the week she works', () => {
    // Sunday: nobody. Monday(1): sadie and kai.
    expect(filterStylists(STYLISTS, { weekday: 0 })).toEqual([]);
    expect(ids(filterStylists(STYLISTS, { weekday: 1 }))).toEqual(['sadie', 'kai']);
  });

  it('combines filters', () => {
    expect(ids(filterStylists(STYLISTS, { service: 'highlights', weekday: 2 }))).toEqual([
      'london',
    ]);
  });
});

describe('parseWeekday', () => {
  it('accepts 0 to 6 and rejects everything else', () => {
    expect(parseWeekday('0')).toBe(0);
    expect(parseWeekday('6')).toBe(6);
    expect(parseWeekday('7')).toBeUndefined();
    expect(parseWeekday('-1')).toBeUndefined();
    expect(parseWeekday('abc')).toBeUndefined();
    expect(parseWeekday('')).toBeUndefined();
    expect(parseWeekday(null)).toBeUndefined();
  });
});

describe('describeWorkDays', () => {
  it('reads like a sentence', () => {
    expect(describeWorkDays([2, 3, 4, 5, 6])).toBe(
      'Tuesday, Wednesday, Thursday, Friday, and Saturday',
    );
    expect(describeWorkDays([5, 3])).toBe('Wednesday and Friday');
    expect(describeWorkDays([1])).toBe('Monday');
    expect(describeWorkDays([])).toBe('');
  });
});
