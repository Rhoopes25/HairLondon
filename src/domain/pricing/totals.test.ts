import { describe, expect, it } from 'vitest';
import { SERVICES } from '../../data/seed/services';
import { STYLISTS } from '../../data/seed/stylists';
import { offersService, priceRange, startingPrice, totalDuration, totalPrice } from './totals';

function stylist(id: string) {
  const found = STYLISTS.find((s) => s.id === id);
  if (!found) throw new Error(`Missing seed stylist ${id}`);
  return found;
}

const london = stylist('london');
const kai = stylist('kai');

describe('pricing', () => {
  it('sums the stylist prices for chosen services', () => {
    expect(totalPrice(london, ['haircut', 'color'])).toBe(185);
    expect(totalPrice(london, [])).toBe(0);
  });

  it('throws if a service is not offered', () => {
    expect(() => totalPrice(kai, ['highlights'])).toThrow(/does not offer/);
  });

  it('sums service durations', () => {
    expect(totalDuration(SERVICES, ['haircut', 'color'])).toBe(180);
    expect(totalDuration(SERVICES, [])).toBe(0);
  });

  it('knows which services a stylist offers', () => {
    expect(offersService(kai, 'color')).toBe(true);
    expect(offersService(kai, 'highlights')).toBe(false);
  });

  it('finds the starting price, and null instead of Infinity when she lists nothing', () => {
    expect(startingPrice(kai)).toBe(30);
    expect(startingPrice({ prices: {} })).toBeNull();
  });

  it('finds the price range across stylists', () => {
    expect(priceRange(STYLISTS, 'blowout')).toEqual({ min: 35, max: 45 });
    expect(priceRange(STYLISTS, 'haircut')).toEqual({ min: 45, max: 65 });
  });

  it('returns null when nobody offers the service', () => {
    expect(priceRange([kai], 'highlights')).toBeNull();
  });
});
