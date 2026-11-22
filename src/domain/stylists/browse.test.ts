import { describe, expect, it } from 'vitest';
import { SAMPLE_LOCATION } from '../../data/seed/sample-location';
import { STYLISTS } from '../../data/seed/stylists';
import { activeFilterCount, browseStylists, parseBrowse } from './browse';

const ids = (list: readonly { id: string }[]) => list.map((stylist) => stylist.id);
const from = SAMPLE_LOCATION; // downtown Provo

describe('browseStylists', () => {
  it('returns everyone, in the order given, when nothing is chosen', () => {
    expect(ids(browseStylists(STYLISTS, {}, from))).toEqual(ids(STYLISTS));
    expect(ids(browseStylists(STYLISTS, { sort: 'best' }, from))).toEqual(ids(STYLISTS));
  });

  it('sorts nearest first, so Provo chairs come before Lehi', () => {
    const sorted = ids(browseStylists(STYLISTS, { sort: 'nearest' }, from));
    expect(sorted.slice(0, 2).sort()).toEqual(['london', 'marcus']);
    expect(sorted.at(-1)).toBe('kai');
  });

  it('sorts lowest starting price first, and keeps ties in their given order', () => {
    const sorted = ids(browseStylists(STYLISTS, { sort: 'price' }, from));
    expect(sorted[0]).toBe('diego'); // $18+
    // Kai and Marcus both start at $20; Kai is listed first, so Kai stays first.
    expect(sorted.indexOf('kai')).toBeLessThan(sorted.indexOf('marcus'));
    expect(sorted.at(-1)).toBe('brooke');
  });

  it('keeps only stylists at or under a starting price', () => {
    expect(ids(browseStylists(STYLISTS, { maxPrice: 25 }, from)).sort()).toEqual([
      'diego',
      'kai',
      'marcus',
    ]);
    expect(ids(browseStylists(STYLISTS, { maxPrice: 35 }, from))).toContain('london');
    expect(ids(browseStylists(STYLISTS, { maxPrice: 35 }, from))).not.toContain('sadie');
  });

  it('keeps only stylists within a distance of where she is', () => {
    expect(ids(browseStylists(STYLISTS, { maxMiles: 5 }, from)).sort()).toEqual([
      'london',
      'marcus',
      'sadie',
    ]);
    expect(ids(browseStylists(STYLISTS, { maxMiles: 10 }, from))).toContain('brooke');
    expect(ids(browseStylists(STYLISTS, { maxMiles: 20 }, from))).toHaveLength(STYLISTS.length);
  });

  it('keeps only stylists known for a specialty', () => {
    expect(ids(browseStylists(STYLISTS, { area: 'mens' }, from)).sort()).toEqual([
      'diego',
      'kai',
      'marcus',
    ]);
    expect(ids(browseStylists(STYLISTS, { area: 'blonde' }, from)).sort()).toEqual([
      'brooke',
      'london',
    ]);
  });

  it('combines filters and then sorts what is left', () => {
    const result = browseStylists(STYLISTS, { area: 'mens', maxMiles: 10, sort: 'price' }, from);
    expect(ids(result)).toEqual(['marcus']);
  });

  it('measures from wherever she is, not from a fixed place', () => {
    const lehi = { lat: 40.3916, lng: -111.8566 };
    expect(ids(browseStylists(STYLISTS, { sort: 'nearest' }, lehi))[0]).toBe('kai');
  });

  it('can come back empty without breaking', () => {
    expect(browseStylists(STYLISTS, { area: 'cuts', maxPrice: 25, maxMiles: 5 }, from)).toEqual([]);
  });
});

describe('parseBrowse', () => {
  it('reads known values', () => {
    expect(parseBrowse({ sort: 'price', price: '35', within: '10', area: 'color' })).toEqual({
      sort: 'price',
      maxPrice: 35,
      maxMiles: 10,
      area: 'color',
    });
  });

  it('ignores anything it does not recognize, so a typed link never breaks the page', () => {
    expect(parseBrowse({ sort: 'oldest', price: '999', within: 'far', area: 'beards' })).toEqual({
      sort: undefined,
      maxPrice: undefined,
      maxMiles: undefined,
      area: undefined,
    });
    expect(parseBrowse({})).toEqual({
      sort: undefined,
      maxPrice: undefined,
      maxMiles: undefined,
      area: undefined,
    });
  });
});

describe('activeFilterCount', () => {
  it('counts filters, not the sort', () => {
    expect(activeFilterCount({ sort: 'price' })).toBe(0);
    expect(activeFilterCount({ maxPrice: 25, area: 'mens' })).toBe(2);
    expect(activeFilterCount({ maxPrice: 25, maxMiles: 5, area: 'mens', sort: 'nearest' })).toBe(3);
  });
});
