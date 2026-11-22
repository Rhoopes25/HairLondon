import { describe, expect, it } from 'vitest';
import { STYLISTS } from '../../data/seed/stylists';
import { formatStartingPriceRange } from '../format/price';
import { estimateAcrossStylists } from './estimate';
import { isLongVisit, LONG_VISIT_MIN } from './totals';

describe('estimateAcrossStylists', () => {
  it('says nothing until a service is picked', () => {
    expect(estimateAcrossStylists(STYLISTS, [])).toBeNull();
  });

  it('gives the lowest to highest starting total among stylists who do every service', () => {
    // Haircut: London $65, Sadie $55, Kai $45, Brooke $60.
    expect(estimateAcrossStylists(STYLISTS, ['haircut'])).toEqual({
      min: 45,
      max: 65,
      stylistCount: 4,
    });
    // Color + highlights: London 120+150, Sadie 110+165, Brooke 130+175 (Kai does no highlights).
    expect(estimateAcrossStylists(STYLISTS, ['color', 'highlights'])).toEqual({
      min: 270,
      max: 305,
      stylistCount: 3,
    });
  });

  it('is a single price when only one stylist does the combination', () => {
    // Only London does highlights and a men's cut: $150 + $50.
    expect(estimateAcrossStylists(STYLISTS, ['highlights', 'mens-haircut'])).toEqual({
      min: 200,
      max: 200,
      stylistCount: 1,
    });
  });

  it('is null when nobody does all of them together', () => {
    expect(estimateAcrossStylists(STYLISTS, ['highlights', 'beard-trim'])).toBeNull();
  });
});

describe('formatStartingPriceRange', () => {
  it('keeps the plus, because every price is a starting price', () => {
    expect(formatStartingPriceRange(120, 145)).toBe('$120–145+');
    expect(formatStartingPriceRange(85, 85)).toBe('$85+');
  });
});

describe('isLongVisit', () => {
  it('is more than four hours, and exactly four hours is not', () => {
    expect(LONG_VISIT_MIN).toBe(240);
    expect(isLongVisit(240)).toBe(false);
    expect(isLongVisit(241)).toBe(true);
    expect(isLongVisit(270)).toBe(true);
    expect(isLongVisit(60)).toBe(false);
  });
});
