import { describe, expect, it } from 'vitest';
import { fixedClock } from '../clock';
import type { Appointment } from '../models/appointment';
import { durationMin, minuteOfDay } from '../models/time';
import type { IsoDate } from '../models/time';
import {
  appointmentEnd,
  appointmentPhase,
  appointmentStartsAt,
  groupAppointments,
} from './appointments';
import { validateDetails } from './validate-details';

describe('validateDetails', () => {
  it('accepts a name and a ten-digit phone and formats the phone', () => {
    expect(validateDetails({ name: '  Maren  ', phone: '555 123 4567' }, 'Sadie')).toEqual({
      ok: true,
      value: { name: 'Maren', phone: '(555) 123-4567' },
    });
  });

  it('explains each problem, personalized with the stylist name', () => {
    const result = validateDetails({ name: ' ', phone: '123' }, 'Sadie');
    expect(result).toEqual({
      ok: false,
      errors: {
        name: 'Enter your name so Sadie knows who’s coming.',
        phone: 'Enter a 10-digit phone number.',
      },
    });
  });

  it('reports only the field that is wrong', () => {
    const result = validateDetails({ name: 'Maren', phone: '' }, 'Sadie');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors)).toEqual(['phone']);
  });
});

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    stylistId: 'london',
    serviceIds: ['haircut'],
    date: '2026-10-16' as IsoDate,
    start: minuteOfDay(13),
    durationMin: durationMin(60),
    total: 65,
    name: 'Maren',
    phone: '(555) 123-4567',
    status: 'booked',
    ...overrides,
  };
}

describe('appointments', () => {
  const clock = fixedClock(new Date(2026, 9, 7, 9, 0));

  it('computes the end and the start moment', () => {
    expect(appointmentEnd(appointment())).toBe(minuteOfDay(14));
    expect(appointmentStartsAt(appointment()).getHours()).toBe(13);
  });

  it('is upcoming before it starts, past after, and cancelled stays cancelled', () => {
    expect(appointmentPhase(appointment(), clock)).toBe('upcoming');
    expect(appointmentPhase(appointment({ date: '2026-10-01' as IsoDate }), clock)).toBe('past');
    expect(appointmentPhase(appointment({ status: 'cancelled' }), clock)).toBe('cancelled');
  });

  it('groups and sorts: upcoming soonest first, past most recent first', () => {
    const soon = appointment({ id: 'soon', date: '2026-10-10' as IsoDate });
    const later = appointment({ id: 'later', date: '2026-10-20' as IsoDate });
    const old = appointment({ id: 'old', date: '2026-09-01' as IsoDate });
    const recent = appointment({ id: 'recent', date: '2026-10-02' as IsoDate });
    const dropped = appointment({ id: 'dropped', status: 'cancelled' });

    const grouped = groupAppointments([later, old, dropped, soon, recent], clock);
    expect(grouped.upcoming.map((a) => a.id)).toEqual(['soon', 'later']);
    expect(grouped.past.map((a) => a.id)).toEqual(['recent', 'old']);
    expect(grouped.cancelled.map((a) => a.id)).toEqual(['dropped']);
  });
});
