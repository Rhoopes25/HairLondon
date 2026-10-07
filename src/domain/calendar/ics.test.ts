import { describe, expect, it } from 'vitest';
import { SERVICES } from '../../data/seed/services';
import type { Appointment } from '../models/appointment';
import { durationMin, minuteOfDay } from '../models/time';
import type { IsoDate } from '../models/time';
import { buildIcs, icsLocalStamp } from './ics';

const appointment: Appointment = {
  id: 'apt_1',
  stylistId: 'sadie',
  serviceIds: ['haircut', 'color'],
  date: '2026-10-16' as IsoDate,
  start: minuteOfDay(13, 30),
  durationMin: durationMin(180),
  total: 165,
  name: 'Maren',
  phone: '(555) 123-4567',
  status: 'booked',
};

describe('buildIcs', () => {
  const ics = buildIcs({
    appointment,
    stylist: { name: 'Sadie Morgan', studio: 'Juniper Hair Studio', city: 'Orem' },
    catalog: SERVICES,
    stamp: new Date(Date.UTC(2026, 9, 7, 15, 30, 5)),
  });

  it('writes a single event with local start and end times', () => {
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART:20261016T133000');
    expect(ics).toContain('DTEND:20261016T163000');
    expect(ics).toContain('DTSTAMP:20261007T153005Z');
    expect(ics).toContain('UID:apt_1@hairbylondon');
  });

  it('names the services and stylist, and escapes the comma in the location', () => {
    expect(ics).toContain('SUMMARY:Haircut + Color with Sadie');
    expect(ics).toContain('LOCATION:Juniper Hair Studio\\, Orem');
  });

  it('uses CRLF line endings as the format requires', () => {
    expect(ics.split('\r\n').length).toBeGreaterThan(10);
    expect(ics).not.toMatch(/[^\r]\n/);
    expect(ics.endsWith('\r\n')).toBe(true);
  });
});

describe('icsLocalStamp', () => {
  it('pads and rolls past midnight', () => {
    expect(icsLocalStamp('2026-01-05' as IsoDate, minuteOfDay(9))).toBe('20260105T090000');
    expect(icsLocalStamp('2026-01-05' as IsoDate, minuteOfDay(24, 30))).toBe('20260106T003000');
  });
});
