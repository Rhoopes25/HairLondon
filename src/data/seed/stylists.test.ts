import { describe, expect, it } from 'vitest';
import { formatRating } from '../../domain/format/rating';
import { averageRating } from '../../domain/format/rating';
import { SERVICE_IDS } from '../../domain/models/service';
import { offersService } from '../../domain/pricing/totals';
import { SERVICES } from './services';
import { STYLISTS } from './stylists';

/** The user tests found "too few reviews" and thin galleries; these are the floors that fix it. */
const MIN_REVIEWS = 50;
const MIN_PHOTOS = 6;

/** Reviews are meant to cover the two years before the seed was written (Nov 2026). */
const OLDEST_ALLOWED = '2024-11-01';
const NEWEST_ALLOWED = '2026-11-30';

describe.each(STYLISTS.map((stylist) => [stylist.id, stylist] as const))('seed: %s', (_id, s) => {
  it(`has at least ${MIN_REVIEWS} reviews, newest first, each with a unique id`, () => {
    expect(s.reviews.length).toBeGreaterThanOrEqual(MIN_REVIEWS);
    expect(new Set(s.reviews.map((review) => review.id)).size).toBe(s.reviews.length);
    const dates = s.reviews.map((review) => review.date ?? '');
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('has mostly 4 and 5 star reviews, a few 3s, and nothing below 3', () => {
    const count = (stars: number) => s.reviews.filter((review) => review.stars === stars).length;
    expect(s.reviews.every((review) => review.stars >= 3 && review.stars <= 5)).toBe(true);
    expect(count(3)).toBeGreaterThanOrEqual(1);
    expect(count(3)).toBeLessThanOrEqual(6);
    expect((count(4) + count(5)) / s.reviews.length).toBeGreaterThan(0.9);
    expect(count(5)).toBeGreaterThan(count(4));
  });

  it('shows names as a first name and last initial', () => {
    for (const review of s.reviews) expect(review.name).toMatch(/^[A-Z][a-z]+ [A-Z]\.$/);
    expect(new Set(s.reviews.map((review) => review.name)).size).toBe(s.reviews.length);
  });

  it('spreads reviews over the last two years', () => {
    const dates = s.reviews.map((review) => review.date ?? '').sort();
    expect((dates[0] ?? '') >= OLDEST_ALLOWED).toBe(true);
    expect((dates.at(-1) ?? '') <= NEWEST_ALLOWED).toBe(true);
    // Not bunched up: some in the first half of the window, some in the last quarter.
    expect(dates.filter((date) => date < '2025-11-01').length).toBeGreaterThan(8);
    expect(dates.filter((date) => date > '2026-08-01').length).toBeGreaterThan(5);
  });

  it('keeps her rating in step with her reviews', () => {
    const average = averageRating(s.reviews);
    const byHand = s.reviews.reduce((sum, review) => sum + review.stars, 0) / s.reviews.length;
    expect(average).toBeCloseTo(byHand, 10);
    // A believable "mostly 4 and 5" average: not perfect, not poor.
    expect(Number(formatRating(average ?? 0))).toBeGreaterThanOrEqual(4.4);
    expect(Number(formatRating(average ?? 0))).toBeLessThanOrEqual(4.9);
  });

  it('writes short, real-sounding comments', () => {
    for (const review of s.reviews) {
      expect(review.text.length).toBeGreaterThan(5);
      expect(review.text.length).toBeLessThan(220);
    }
  });

  it(`has at least ${MIN_PHOTOS} photos, each captioned and unique`, () => {
    expect(s.portfolio.length).toBeGreaterThanOrEqual(MIN_PHOTOS);
    expect(new Set(s.portfolio.map((photo) => photo.src)).size).toBe(s.portfolio.length);
    for (const photo of s.portfolio) {
      expect(photo.caption.trim().length).toBeGreaterThan(8);
      expect(photo.alt.trim().length).toBeGreaterThan(8);
    }
  });

  it('marks every stand-in tile as a placeholder so it can be swapped', () => {
    for (const photo of s.portfolio) {
      if (photo.src.includes('placeholder-')) expect(photo.placeholder).toBe(true);
    }
  });

  it('only prices services the site knows, and has a way to be found by specialty', () => {
    for (const id of Object.keys(s.prices)) expect(SERVICE_IDS).toContain(id);
    expect(s.areas.length).toBeGreaterThan(0);
  });
});

describe('the men’s, beard, and kids’ side of the site', () => {
  it('offers men’s haircut, beard trim, and kids’ cut as services', () => {
    expect(SERVICES['mens-haircut'].name).toBe('Men’s Haircut');
    expect(SERVICES['beard-trim'].name).toBe('Beard Trim');
    expect(SERVICES['kids-cut'].name).toBe('Kids’ Cut');
  });

  it('has at least two barbers, who are not women’s-only stylists', () => {
    const barbers = STYLISTS.filter(
      (s) => offersService(s, 'mens-haircut') && !offersService(s, 'haircut'),
    );
    expect(barbers.length).toBeGreaterThanOrEqual(2);
    for (const barber of barbers) expect(barber.areas).toContain('mens');
  });

  it('puts men’s cut photos in some other stylists’ galleries too', () => {
    const withMensPhotos = STYLISTS.filter(
      (s) => offersService(s, 'haircut') && s.portfolio.some((p) => p.src.includes('mens')),
    );
    expect(withMensPhotos.length).toBeGreaterThanOrEqual(2);
  });
});
