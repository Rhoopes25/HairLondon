import { describe, expect, it } from 'vitest';
import { fixedClock } from '../clock';
import { asMinuteOfDay, durationMin, minuteOfDay } from '../models/time';
import type { IsoDate } from '../models/time';
import { AppointmentAwareAvailability } from './appointment-aware-availability';
import type { AvailabilityStrategy } from './availability';
import { SALON_HOURS } from './salon-hours';
import { bookableDays, isStartAvailable, listSlots } from './slots';
import type { SlotContext } from './slots';
import type { Appointment } from '../models/appointment';

const openAll: AvailabilityStrategy = { isBlockBooked: () => false };

function blockedAt(...blocks: number[]): AvailabilityStrategy {
  return { isBlockBooked: (_stylist, _date, block) => blocks.includes(block) };
}

/** Wed Oct 7, 2026, 8:00 AM local. */
const morning = fixedClock(new Date(2026, 9, 7, 8, 0));
const date = '2026-10-14' as IsoDate; // a later Wednesday, so the lead-time rule does not apply

function context(strategy: AvailabilityStrategy, clock = morning): SlotContext {
  return { strategy, clock, stylistId: 'london' };
}

describe('isStartAvailable', () => {
  it('rejects a visit that would run past closing', () => {
    // 5:00 PM + 90 min runs to 6:30 PM; the salon closes at 6:00 PM.
    expect(isStartAvailable(context(openAll), date, minuteOfDay(17), durationMin(90))).toBe(false);
    expect(isStartAvailable(context(openAll), date, minuteOfDay(16, 30), durationMin(90))).toBe(
      true,
    );
  });

  it('rejects a visit that overlaps any booked block it spans', () => {
    const ctx = context(blockedAt(minuteOfDay(11)));
    expect(isStartAvailable(ctx, date, minuteOfDay(10), durationMin(90))).toBe(false); // covers 10:00, 10:30, 11:00
    expect(isStartAvailable(ctx, date, minuteOfDay(10), durationMin(60))).toBe(true); // ends at 11:00
  });

  it('requires an hour of lead time today, inclusive', () => {
    const now = fixedClock(new Date(2026, 9, 7, 10, 0));
    const today = '2026-10-07' as IsoDate;
    expect(isStartAvailable(context(openAll, now), today, minuteOfDay(11), durationMin(30))).toBe(
      false,
    );
    expect(
      isStartAvailable(context(openAll, now), today, minuteOfDay(11, 30), durationMin(30)),
    ).toBe(true);
  });
});

describe('listSlots', () => {
  it('lists every 30-minute start from open to just before close', () => {
    const slots = listSlots(context(openAll), date, durationMin(30));
    expect(slots).toHaveLength(18);
    expect(slots[0]?.start).toBe(SALON_HOURS.open);
    expect(slots.at(-1)?.start).toBe(minuteOfDay(17, 30));
  });

  it('marks long visits unavailable near closing', () => {
    const slots = listSlots(context(openAll), date, durationMin(120));
    const lastOpen = slots.filter((s) => s.available).at(-1);
    expect(lastOpen?.start).toBe(minuteOfDay(16));
  });

  it('treats "no service yet" as the shortest visit', () => {
    const none = listSlots(context(openAll), date, durationMin(0));
    expect(none.every((slot) => slot.available)).toBe(true);
  });
});

describe('bookableDays', () => {
  it('returns only the days she works, starting today', () => {
    // Oct 7, 2026 is a Wednesday. Works Wed(3) and Fri(5).
    const days = bookableDays(morning, [3, 5]);
    expect(days.slice(0, 4)).toEqual(['2026-10-07', '2026-10-09', '2026-10-14', '2026-10-16']);
  });

  it('covers three weeks', () => {
    const days = bookableDays(morning, [0, 1, 2, 3, 4, 5, 6]);
    expect(days).toHaveLength(SALON_HOURS.daysAhead);
    expect(days.at(-1)).toBe('2026-10-27');
  });
});

describe('AppointmentAwareAvailability', () => {
  const booked: Appointment = {
    id: 'a1',
    stylistId: 'london',
    serviceIds: ['blowout'],
    date,
    start: minuteOfDay(10),
    durationMin: durationMin(45),
    total: 45,
    name: 'Test',
    phone: '(555) 000-0000',
    status: 'booked',
  };

  function strategyWith(...appointments: Appointment[]) {
    return new AppointmentAwareAvailability(
      openAll,
      (stylistId, day) => appointments.filter((a) => a.stylistId === stylistId && a.date === day),
      SALON_HOURS.step,
    );
  }

  const blocks = (strategy: AvailabilityStrategy) =>
    [600, 630, 660].filter((b) => strategy.isBlockBooked('london', date, asMinuteOfDay(b)));

  it('blocks every grid block a 45-minute visit touches', () => {
    // 10:00 to 10:45 touches the 10:00 and 10:30 blocks, not 11:00.
    expect(blocks(strategyWith(booked))).toEqual([600, 630]);
  });

  it('frees the slot when the appointment is cancelled', () => {
    expect(blocks(strategyWith({ ...booked, status: 'cancelled' }))).toEqual([]);
  });

  it('keeps the base strategy blocking too', () => {
    const strategy = new AppointmentAwareAvailability(blockedAt(660), () => [], SALON_HOURS.step);
    expect(blocks(strategy)).toEqual([660]);
  });

  it('only affects the same stylist', () => {
    const other = strategyWith({ ...booked, stylistId: 'sadie' });
    expect(blocks(other)).toEqual([]);
  });
});
