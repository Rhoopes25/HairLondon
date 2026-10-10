import { formatDay } from '../format/date';
import { formatDuration } from '../format/duration';
import { formatStartingPrice } from '../format/price';
import { formatRange, formatTime } from '../format/time';
import type { ServiceCatalog, ServiceId } from '../models/service';
import { addDuration, durationMin } from '../models/time';
import type { IsoDate, MinuteOfDay } from '../models/time';
import type { Stylist } from '../models/stylist';
import { offersService, totalDuration, totalPrice } from '../pricing/totals';
import { SALON_HOURS } from '../scheduling/salon-hours';
import { bookableDays, isStartAvailable } from '../scheduling/slots';
import type { SlotContext } from '../scheduling/slots';

/** What the client has picked so far. Personal details are collected separately, at the last step. */
export interface BookingDraft {
  readonly stylistId: string;
  /** In the order they were picked. */
  readonly serviceIds: readonly ServiceId[];
  readonly date: IsoDate | null;
  readonly start: MinuteOfDay | null;
}

export function emptyDraft(stylistId: string, presetService?: ServiceId): BookingDraft {
  return {
    stylistId,
    serviceIds: presetService ? [presetService] : [],
    date: null,
    start: null,
  };
}

/** What a link can carry into booking: services, and a day and time she already chose. */
export interface DraftPreset {
  readonly serviceIds?: readonly ServiceId[];
  readonly date?: IsoDate | null;
  readonly start?: MinuteOfDay | null;
}

/**
 * A draft that starts from a link, such as a time tapped on the Book page. Links are typed and
 * shared, so nothing is trusted: services must be ones she offers, the day one she works and can
 * be booked, and the time still open for the visit. Whatever fails is simply left unchosen.
 */
export function presetDraft(
  stylist: Stylist,
  preset: DraftPreset,
  context: SlotContext,
  catalog: ServiceCatalog,
): BookingDraft {
  const serviceIds = (preset.serviceIds ?? []).filter((id) => offersService(stylist, id));
  const draft: BookingDraft = { ...emptyDraft(stylist.id), serviceIds };

  const hours = context.hours ?? SALON_HOURS;
  const date = preset.date ?? null;
  if (date === null || !bookableDays(context.clock, stylist.workDays, hours).includes(date)) {
    return draft;
  }
  const dated: BookingDraft = { ...draft, date };

  const start = preset.start ?? null;
  if (start === null) return dated;
  const needed = durationMin(Math.max(totalDuration(catalog, serviceIds), hours.step));
  return isStartAvailable(context, date, start, needed) ? { ...dated, start } : dated;
}

export function toggleService(draft: BookingDraft, id: ServiceId): BookingDraft {
  const has = draft.serviceIds.includes(id);
  return {
    ...draft,
    serviceIds: has
      ? draft.serviceIds.filter((existing) => existing !== id)
      : [...draft.serviceIds, id],
  };
}

/** Picking the chosen day again clears it. Any new day clears the time. */
export function selectDate(draft: BookingDraft, date: IsoDate): BookingDraft {
  return { ...draft, date: draft.date === date ? null : date, start: null };
}

/** Picking the chosen time again clears it. */
export function selectStart(draft: BookingDraft, start: MinuteOfDay): BookingDraft {
  return { ...draft, start: draft.start === start ? null : start };
}

export function clearStart(draft: BookingDraft): BookingDraft {
  return draft.start === null ? draft : { ...draft, start: null };
}

export interface CompleteDraft extends BookingDraft {
  readonly date: IsoDate;
  readonly start: MinuteOfDay;
}

export function isComplete(draft: BookingDraft): draft is CompleteDraft {
  return draft.serviceIds.length > 0 && draft.date !== null && draft.start !== null;
}

/** "Haircut + Color · Thu, Oct 16 · 1:00 to 4:00 PM", or the empty-state prompt. */
export function summaryLine(draft: BookingDraft, catalog: ServiceCatalog): string {
  const parts: string[] = [];
  if (draft.serviceIds.length)
    parts.push(draft.serviceIds.map((id) => catalog[id].name).join(' + '));
  if (draft.date) parts.push(formatDay(draft.date));
  if (draft.start !== null) {
    parts.push(
      draft.serviceIds.length
        ? formatRange(
            draft.start,
            addDuration(draft.start, totalDuration(catalog, draft.serviceIds)),
          )
        : formatTime(draft.start),
    );
  }
  return parts.length ? parts.join(' · ') : 'Select services, day & time';
}

/** "$185+ · about 2 hr 30 min", or an em dash until a service is chosen. Prices are starting prices. */
export function totalLine(draft: BookingDraft, stylist: Stylist, catalog: ServiceCatalog): string {
  if (!draft.serviceIds.length) return '—';
  const price = totalPrice(stylist, draft.serviceIds);
  return `${formatStartingPrice(price)} · about ${formatDuration(totalDuration(catalog, draft.serviceIds))}`;
}

export interface BookingProgress {
  readonly percent: number;
  readonly label: string;
}

const PROGRESS_LABELS = ['Pick your services', 'Add your day', 'Choose a time', 'Ready to continue'];

/** How much of step 1 is done: services, a day, a time. Each is a third. */
export function bookingProgress(draft: BookingDraft): BookingProgress {
  const done = [draft.serviceIds.length > 0, draft.date !== null, draft.start !== null].filter(
    Boolean,
  ).length;
  return { percent: Math.round((done / 3) * 100), label: PROGRESS_LABELS[done] ?? '' };
}

export interface TimeNote {
  readonly text: string;
  /** True when something she chose no longer works and she needs to act. */
  readonly warn: boolean;
}

/**
 * The helper line under the time grid, or null when there is nothing to say. `droppedStart` is a
 * time she picked that stopped fitting after she added a service: say so rather than clear it quietly.
 */
export function timeNote(
  draft: BookingDraft,
  catalog: ServiceCatalog,
  droppedStart: MinuteOfDay | null = null,
): TimeNote | null {
  if (droppedStart !== null && draft.start === null) {
    return {
      text: `${formatTime(droppedStart)} doesn’t leave enough time for everything you picked. Choose another time.`,
      warn: true,
    };
  }
  const done = doneByNote(draft, catalog);
  return done ? { text: done, warn: false } : null;
}

/** The helper line under the time grid, or null when there is nothing to say. */
export function doneByNote(draft: BookingDraft, catalog: ServiceCatalog): string | null {
  if (draft.start !== null && draft.serviceIds.length) {
    const end = addDuration(draft.start, totalDuration(catalog, draft.serviceIds));
    return `You’ll be done by about ${formatTime(end)}.`;
  }
  if (draft.date && !draft.serviceIds.length) return 'Pick a service to see when you’ll be done.';
  return null;
}

/** If the chosen time no longer fits (e.g. a longer service was added), drop it so the client picks again. */
export function dropUnavailableStart(
  draft: BookingDraft,
  context: SlotContext,
  catalog: ServiceCatalog,
): BookingDraft {
  if (draft.date === null || draft.start === null) return draft;
  const step = (context.hours ?? SALON_HOURS).step;
  const needed = durationMin(Math.max(totalDuration(catalog, draft.serviceIds), step));
  return isStartAvailable(context, draft.date, draft.start, needed) ? draft : clearStart(draft);
}
