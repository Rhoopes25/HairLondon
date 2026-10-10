import { describe, expect, it } from 'vitest';
import { SERVICES } from '../../data/seed/services';
import { fixedClock } from '../clock';
import { minuteOfDay } from '../models/time';
import type { IsoDate } from '../models/time';
import { createBookingReducer, initialBookingState } from './booking-state';

const day = '2026-10-16' as IsoDate;
const reducer = createBookingReducer({
  context: {
    strategy: { isBlockBooked: () => false },
    clock: fixedClock(new Date(2026, 9, 7, 8, 0)),
    stylistId: 'london',
  },
  catalog: SERVICES,
});

describe('booking reducer', () => {
  it('starts empty, optionally with a preselected service', () => {
    expect(initialBookingState('london').draft.serviceIds).toEqual([]);
    expect(initialBookingState('london', 'color').draft.serviceIds).toEqual(['color']);
  });

  it('walks through choosing services, a day, and a time', () => {
    let state = initialBookingState('london');
    state = reducer(state, { type: 'toggleService', id: 'haircut' });
    state = reducer(state, { type: 'selectDate', date: day });
    state = reducer(state, { type: 'selectStart', start: minuteOfDay(13) });
    expect(state.draft).toMatchObject({ serviceIds: ['haircut'], date: day, start: 780 });
  });

  it('drops the time when a longer service no longer fits it', () => {
    let state = initialBookingState('london', 'haircut');
    state = reducer(state, { type: 'selectDate', date: day });
    state = reducer(state, { type: 'selectStart', start: minuteOfDay(16, 30) });
    state = reducer(state, { type: 'toggleService', id: 'color' });
    expect(state.draft.start).toBeNull();
    expect(state.draft.serviceIds).toEqual(['haircut', 'color']);
  });

  it('keeps the details when going back and forth, and merges partial updates', () => {
    let state = initialBookingState('london');
    state = reducer(state, { type: 'setDetails', details: { name: 'Maren' } });
    state = reducer(state, { type: 'setDetails', details: { phone: '555' } });
    expect(state.details).toEqual({ name: 'Maren', phone: '555' });
  });

  it('resets everything', () => {
    let state = reducer(initialBookingState('london'), { type: 'toggleService', id: 'haircut' });
    state = reducer(state, { type: 'reset', stylistId: 'london' });
    expect(state).toEqual(initialBookingState('london'));
  });
});
