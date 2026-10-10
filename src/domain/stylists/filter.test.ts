import { describe, expect, it } from 'vitest';
import { STYLISTS } from '../../data/seed/stylists';
import { describeWorkDays, parseServiceIds, serviceIdsParam, stylistsOffering } from './filter';

const ids = (list: readonly { id: string }[]) => list.map((s) => s.id);

describe('stylistsOffering', () => {
  it('returns everyone when no service is chosen', () => {
    expect(ids(stylistsOffering(STYLISTS, []))).toEqual(['london', 'sadie', 'kai', 'brooke']);
  });

  it('keeps stylists who offer a service', () => {
    expect(ids(stylistsOffering(STYLISTS, ['highlights']))).toEqual(['london', 'sadie', 'brooke']);
  });

  it('needs every chosen service, so a combination can leave nobody', () => {
    expect(ids(stylistsOffering(STYLISTS, ['highlights', 'deep-conditioning']))).toEqual([
      'london',
      'brooke',
    ]);
    expect(stylistsOffering(STYLISTS, ['highlights', 'haircut', 'deep-conditioning'])).toHaveLength(
      2,
    );
  });
});

describe('parseServiceIds', () => {
  it('reads a comma-separated list in order', () => {
    expect(parseServiceIds('color,haircut')).toEqual(['color', 'haircut']);
  });

  it('drops unknown and repeated ids, and survives empty input', () => {
    expect(parseServiceIds('haircut,nope,haircut, color ')).toEqual(['haircut', 'color']);
    expect(parseServiceIds('')).toEqual([]);
    expect(parseServiceIds(null)).toEqual([]);
  });

  it('round-trips with serviceIdsParam', () => {
    expect(parseServiceIds(serviceIdsParam(['blowout', 'color']))).toEqual(['blowout', 'color']);
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
