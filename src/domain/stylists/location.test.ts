import { describe, expect, it } from 'vitest';
import {
  directionsUrl,
  formatDistance,
  milesBetween,
  nearestMiles,
  sortByDistance,
} from './location';

const provo = { lat: 40.2338, lng: -111.6585 };
const orem = { lat: 40.2969, lng: -111.6946 };
const lehi = { lat: 40.3916, lng: -111.8508 };

describe('milesBetween', () => {
  it('is zero for the same place and about 4.8 miles from Provo to Orem', () => {
    expect(milesBetween(provo, provo)).toBe(0);
    expect(milesBetween(provo, orem)).toBeGreaterThan(4.5);
    expect(milesBetween(provo, orem)).toBeLessThan(5.2);
  });
});

describe('formatDistance', () => {
  it('keeps one decimal under ten miles and rounds beyond', () => {
    expect(formatDistance(0.44)).toBe('0.4 mi away');
    expect(formatDistance(12.6)).toBe('13 mi away');
  });
});

describe('directionsUrl', () => {
  it('encodes the address into a Google Maps directions link', () => {
    expect(directionsUrl({ address: '1 Main St, Provo, UT', ...provo })).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=1%20Main%20St%2C%20Provo%2C%20UT',
    );
  });
});

describe('sortByDistance', () => {
  it('puts the nearest first', () => {
    const items = [
      { id: 'lehi', location: { address: '', ...lehi } },
      { id: 'provo', location: { address: '', ...provo } },
      { id: 'orem', location: { address: '', ...orem } },
    ];
    expect(sortByDistance(items, provo).map((item) => item.id)).toEqual(['provo', 'orem', 'lehi']);
  });
});

describe('nearestMiles', () => {
  it('is the distance to the closest place, and Infinity with none', () => {
    expect(nearestMiles(provo, [lehi, orem])).toBeCloseTo(milesBetween(provo, orem));
    expect(nearestMiles(provo, [])).toBe(Infinity);
  });
});
