import { describe, expect, it } from 'vitest';
import { fixedClock } from '../clock';
import type { Appointment } from '../models/appointment';
import type { DurationMin, IsoDate, MinuteOfDay } from '../models/time';
import { isValidEmail, nextVisit, validateNewAccount } from './account';

const account = { id: 'a', name: 'Rachel', phone: '(801) 555-0142', email: 'r@example.com' };
const visit = (
  id: string,
  date: string,
  phone = '8015550142',
  status: 'booked' | 'cancelled' = 'booked',
): Appointment => ({
  id,
  stylistId: 'london',
  serviceIds: ['haircut'],
  date: date as IsoDate,
  start: 600 as MinuteOfDay,
  durationMin: 60 as DurationMin,
  total: 65,
  name: 'Rachel',
  phone,
  status,
});

describe('validateNewAccount', () => {
  it('asks for a name, a 10-digit phone, and a real-looking email', () => {
    const result = validateNewAccount({ name: ' ', phone: '123', email: 'nope' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['email', 'name', 'phone']);
  });

  it('tidies what it keeps', () => {
    expect(
      validateNewAccount({ name: ' Rachel ', phone: '801.555.0142', email: ' R@Example.com ' }),
    ).toEqual({
      ok: true,
      value: { name: 'Rachel', phone: '(801) 555-0142', email: 'r@example.com' },
    });
    expect(isValidEmail('a@b.co')).toBe(true);
  });
});

describe('nextVisit', () => {
  const clock = fixedClock(new Date(2026, 9, 7, 8, 0));
  it('is her soonest upcoming visit booked with her phone, skipping past, cancelled, and others', () => {
    const all = [
      visit('later', '2026-10-20'),
      visit('past', '2026-10-01'),
      visit('cancelled', '2026-10-08', '8015550142', 'cancelled'),
      visit('someone-else', '2026-10-08', '5551234567'),
      visit('soonest', '2026-10-09'),
    ];
    expect(nextVisit(account, all, clock)?.id).toBe('soonest');
    expect(nextVisit(account, [], clock)).toBeNull();
  });
});
