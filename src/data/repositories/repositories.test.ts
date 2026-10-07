import { describe, expect, it, vi } from 'vitest';
import { fixedClock } from '../../domain/clock';
import { withUserReviews } from '../../domain/reviews';
import { durationMin, minuteOfDay } from '../../domain/models/time';
import type { IsoDate } from '../../domain/models/time';
import { seedAppointments } from '../seed/appointments';
import { STYLISTS } from '../seed/stylists';
import { JsonStore } from '../storage/json-store';
import { MemoryStorageAdapter } from '../storage/memory-storage-adapter';
import type { StorageAdapter } from '../storage/storage-adapter';
import { APPOINTMENTS_KEY, AppointmentRepository } from './appointment-repository';
import type { NewAppointment } from './appointment-repository';
import { PreferencesRepository } from './preferences-repository';
import { ReviewRepository } from './review-repository';
import { SavedStylistRepository } from './saved-stylist-repository';
import { StylistRepository } from './stylist-repository';

const clock = fixedClock(new Date(2026, 9, 7, 9, 0));

const input: NewAppointment = {
  stylistId: 'london',
  serviceIds: ['haircut'],
  date: '2026-10-16' as IsoDate,
  start: minuteOfDay(13),
  durationMin: durationMin(60),
  total: 65,
  name: 'Maren',
  phone: '(555) 123-4567',
};

describe('JsonStore', () => {
  it('returns the same snapshot object until the value changes', () => {
    const store = new JsonStore(new MemoryStorageAdapter(), 'k', ['a'], (raw) =>
      Array.isArray(raw) ? (raw as string[]) : null,
    );
    expect(store.getSnapshot()).toBe(store.getSnapshot());
    const before = store.getSnapshot();
    store.set(['a', 'b']);
    expect(store.getSnapshot()).not.toBe(before);
  });

  it('notifies subscribers until they unsubscribe', () => {
    const store = new JsonStore(new MemoryStorageAdapter(), 'k', 0, (raw) =>
      typeof raw === 'number' ? raw : null,
    );
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.set(1);
    unsubscribe();
    store.set(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('falls back to the initial value on corrupt or wrongly-shaped data', () => {
    const storage = new MemoryStorageAdapter();
    storage.setItem('k', '{not json');
    expect(
      new JsonStore(storage, 'k', 7, (r) => (typeof r === 'number' ? r : null)).getSnapshot(),
    ).toBe(7);
    storage.setItem('k', '"a string"');
    expect(
      new JsonStore(storage, 'k', 7, (r) => (typeof r === 'number' ? r : null)).getSnapshot(),
    ).toBe(7);
  });

  it('keeps working in memory when storage throws', () => {
    const broken: StorageAdapter = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => undefined,
    };
    const store = new JsonStore(broken, 'k', 1, (r) => (typeof r === 'number' ? r : null));
    store.set(5);
    expect(store.getSnapshot()).toBe(5);
  });
});

describe('AppointmentRepository', () => {
  it('adds, finds, and lists a day', () => {
    const repo = new AppointmentRepository(new MemoryStorageAdapter(), clock);
    const added = repo.add(input);
    expect(added.status).toBe('booked');
    expect(repo.get(added.id)).toEqual(added);
    expect(repo.listOn('london', input.date)).toHaveLength(1);
    expect(repo.listOn('sadie', input.date)).toHaveLength(0);
  });

  it('cancels and reschedules', () => {
    const repo = new AppointmentRepository(new MemoryStorageAdapter(), clock);
    const { id } = repo.add(input);
    repo.reschedule(id, '2026-10-20' as IsoDate, minuteOfDay(9));
    expect(repo.get(id)).toMatchObject({ date: '2026-10-20', start: 540 });
    repo.cancel(id);
    expect(repo.get(id)?.status).toBe('cancelled');
  });

  it('persists across instances sharing storage', () => {
    const storage = new MemoryStorageAdapter();
    const { id } = new AppointmentRepository(storage, clock).add(input);
    expect(new AppointmentRepository(storage, clock).get(id)).not.toBeNull();
  });

  it('stores the initial sample on first run only', () => {
    const storage = new MemoryStorageAdapter();
    const first = new AppointmentRepository(storage, clock, seedAppointments(clock));
    expect(first.list()).toHaveLength(1);
    first.cancel('apt_sample_past');
    const second = new AppointmentRepository(storage, clock, seedAppointments(clock));
    expect(second.get('apt_sample_past')?.status).toBe('cancelled');
  });

  it('ignores stored data with the wrong shape', () => {
    const storage = new MemoryStorageAdapter();
    storage.setItem(APPOINTMENTS_KEY, JSON.stringify([{ id: 1 }]));
    expect(new AppointmentRepository(storage, clock).list()).toEqual([]);
  });

  it('notifies subscribers on change', () => {
    const repo = new AppointmentRepository(new MemoryStorageAdapter(), clock);
    const listener = vi.fn();
    repo.subscribe(listener);
    repo.add(input);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('SavedStylistRepository', () => {
  it('toggles a stylist saved and unsaved', () => {
    const repo = new SavedStylistRepository(new MemoryStorageAdapter());
    repo.toggle('kai');
    expect(repo.isSaved('kai')).toBe(true);
    repo.toggle('kai');
    expect(repo.isSaved('kai')).toBe(false);
  });
});

describe('ReviewRepository', () => {
  it('adds a review and tracks which visit it was for', () => {
    const repo = new ReviewRepository(new MemoryStorageAdapter(), clock);
    expect(repo.hasReviewFor('a1')).toBe(false);
    repo.add({ stylistId: 'london', appointmentId: 'a1', name: 'Maren', stars: 5, text: 'Great.' });
    expect(repo.hasReviewFor('a1')).toBe(true);
  });

  it('rejects an out-of-range rating', () => {
    const repo = new ReviewRepository(new MemoryStorageAdapter(), clock);
    expect(() =>
      repo.add({ stylistId: 'london', appointmentId: 'a1', name: 'M', stars: 6, text: 'x' }),
    ).toThrow();
  });

  it('puts new reviews ahead of the sample ones on the stylist', () => {
    const repo = new ReviewRepository(new MemoryStorageAdapter(), clock);
    repo.add({ stylistId: 'london', appointmentId: 'a1', name: 'Maren', stars: 5, text: 'Great.' });
    const london = new StylistRepository(STYLISTS).get('london');
    if (!london) throw new Error('missing');
    const merged = withUserReviews(london, repo.getSnapshot());
    expect(merged.reviews[0]?.text).toBe('Great.');
    expect(merged.reviews).toHaveLength(london.reviews.length + 1);
  });
});

describe('PreferencesRepository', () => {
  it('remembers that the notice was dismissed', () => {
    const storage = new MemoryStorageAdapter();
    const prefs = new PreferencesRepository(storage);
    expect(prefs.getSnapshot().noticeDismissed).toBe(false);
    prefs.dismissNotice();
    expect(new PreferencesRepository(storage).getSnapshot().noticeDismissed).toBe(true);
  });
});

describe('StylistRepository', () => {
  const repo = new StylistRepository(STYLISTS);

  it('looks up by id and returns null for unknown or missing ids', () => {
    expect(repo.get('sadie')?.name).toBe('Sadie Morgan');
    expect(repo.get('nobody')).toBeNull();
    expect(repo.get(null)).toBeNull();
  });

  it('finds the stylists who offer a service', () => {
    expect(repo.offering('highlights').map((s) => s.id)).toEqual(['london', 'sadie', 'brooke']);
  });
});
