import { describe, expect, it } from 'vitest';
import { SERVICES } from '../../data/seed/services';
import { STYLISTS } from '../../data/seed/stylists';
import { fixedClock } from '../clock';
import { minuteOfDay } from '../models/time';
import type { IsoDate } from '../models/time';
import {
  clearStart,
  doneByNote,
  dropUnavailableStart,
  emptyDraft,
  isComplete,
  selectDate,
  selectStart,
  summaryLine,
  toggleService,
  totalLine,
} from './draft';

const day = '2026-10-16' as IsoDate;
const other = '2026-10-17' as IsoDate;
const london = STYLISTS[0];
if (!london) throw new Error('seed stylist missing');

describe('booking draft', () => {
  it('starts empty, or with a preselected service', () => {
    expect(emptyDraft('london')).toEqual({
      stylistId: 'london',
      serviceIds: [],
      date: null,
      start: null,
    });
    expect(emptyDraft('london', 'color').serviceIds).toEqual(['color']);
  });

  it('toggles services in the order picked', () => {
    let draft = emptyDraft('london');
    draft = toggleService(draft, 'color');
    draft = toggleService(draft, 'haircut');
    expect(draft.serviceIds).toEqual(['color', 'haircut']);
    expect(toggleService(draft, 'color').serviceIds).toEqual(['haircut']);
  });

  it('clears the time when a new day is picked, and the day when the same day is picked again', () => {
    let draft = selectDate(emptyDraft('london'), day);
    draft = selectStart(draft, minuteOfDay(13));
    expect(selectDate(draft, other)).toMatchObject({ date: other, start: null });
    expect(selectDate(draft, day)).toMatchObject({ date: null, start: null });
  });

  it('clears a time when it is picked again', () => {
    const draft = selectStart(emptyDraft('london'), minuteOfDay(13));
    expect(selectStart(draft, minuteOfDay(13)).start).toBeNull();
    expect(clearStart(draft).start).toBeNull();
  });

  it('is complete only with a service, a day, and a time', () => {
    let draft = emptyDraft('london');
    expect(isComplete(draft)).toBe(false);
    draft = toggleService(draft, 'haircut');
    draft = selectDate(draft, day);
    expect(isComplete(draft)).toBe(false);
    expect(isComplete(selectStart(draft, minuteOfDay(13)))).toBe(true);
  });
});

describe('draft summary', () => {
  it('prompts when nothing is chosen', () => {
    expect(summaryLine(emptyDraft('london'), SERVICES)).toBe('Select services, day & time');
    expect(totalLine(emptyDraft('london'), london, SERVICES)).toBe('—');
  });

  it('describes services, day, and the time range', () => {
    let draft = toggleService(emptyDraft('london'), 'haircut');
    draft = selectDate(draft, day);
    draft = selectStart(draft, minuteOfDay(13));
    expect(summaryLine(draft, SERVICES)).toBe('Haircut · Fri, Oct 16 · 1:00 to 2:00 PM');
    expect(totalLine(draft, london, SERVICES)).toBe('$65 · 1 hr');
  });

  it('shows just the start time when no service is chosen yet', () => {
    const draft = selectStart(selectDate(emptyDraft('london'), day), minuteOfDay(13));
    expect(summaryLine(draft, SERVICES)).toBe('Fri, Oct 16 · 1:00 PM');
  });

  it('says when you will be done, or asks for a service', () => {
    let draft = selectDate(emptyDraft('london'), day);
    expect(doneByNote(draft, SERVICES)).toBe('Pick a service to see when you’ll be done.');
    draft = toggleService(draft, 'color');
    draft = selectStart(draft, minuteOfDay(13));
    expect(doneByNote(draft, SERVICES)).toBe('You’ll be done by 3:00 PM.');
    expect(doneByNote(emptyDraft('london'), SERVICES)).toBeNull();
  });
});

describe('dropUnavailableStart', () => {
  const context = {
    strategy: { isBlockBooked: () => false },
    clock: fixedClock(new Date(2026, 9, 7, 8, 0)),
    stylistId: 'london',
  };

  it('keeps a time that still fits', () => {
    let draft = toggleService(emptyDraft('london'), 'haircut');
    draft = selectStart(selectDate(draft, day), minuteOfDay(13));
    expect(dropUnavailableStart(draft, context, SERVICES)).toBe(draft);
  });

  it('drops a time that no longer fits after a longer service is added', () => {
    // 4:30 PM fits a 1 hour haircut (ends 5:30) but not haircut + color (3 hours).
    let draft = toggleService(emptyDraft('london'), 'haircut');
    draft = selectStart(selectDate(draft, day), minuteOfDay(16, 30));
    expect(dropUnavailableStart(draft, context, SERVICES).start).toBe(minuteOfDay(16, 30));
    const longer = toggleService(draft, 'color');
    expect(dropUnavailableStart(longer, context, SERVICES).start).toBeNull();
  });

  it('leaves a draft with no time alone', () => {
    const draft = emptyDraft('london');
    expect(dropUnavailableStart(draft, context, SERVICES)).toBe(draft);
  });
});
