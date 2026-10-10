import type { ServiceCatalog, ServiceId } from '../models/service';
import type { IsoDate, MinuteOfDay } from '../models/time';
import type { SlotContext } from '../scheduling/slots';
import { dropUnavailableStart, emptyDraft, selectDate, selectStart, toggleService } from './draft';
import type { BookingDraft } from './draft';
import type { DetailsInput } from './validate-details';

/**
 * The booking wizard's state: what has been picked, plus the personal details typed so far.
 * Which step is showing is not stored here; it is the URL (choose, details, review, done).
 */
export interface BookingState {
  readonly draft: BookingDraft;
  readonly details: DetailsInput;
  /** A time she had picked that stopped fitting when she added a service, so the page can say so. */
  readonly droppedStart: MinuteOfDay | null;
}

export type BookingAction =
  | { readonly type: 'toggleService'; readonly id: ServiceId }
  | { readonly type: 'selectDate'; readonly date: IsoDate }
  | { readonly type: 'selectStart'; readonly start: MinuteOfDay }
  | { readonly type: 'setDetails'; readonly details: Partial<DetailsInput> }
  | { readonly type: 'reset'; readonly stylistId: string };

/** What the reducer needs to know about the outside world to keep the draft valid. */
export interface BookingEnv {
  readonly context: SlotContext;
  readonly catalog: ServiceCatalog;
}

export function initialBookingState(
  stylistId: string,
  draft: BookingDraft = emptyDraft(stylistId),
): BookingState {
  return { draft, details: { name: '', phone: '' }, droppedStart: null };
}

/**
 * A finite state machine for the draft. Every transition goes through a pure domain function;
 * the only rule added here is that a change must never leave an unavailable time selected.
 */
export function createBookingReducer(env: BookingEnv) {
  return function bookingReducer(state: BookingState, action: BookingAction): BookingState {
    switch (action.type) {
      case 'toggleService': {
        const draft = dropUnavailableStart(
          toggleService(state.draft, action.id),
          env.context,
          env.catalog,
        );
        const dropped = state.draft.start !== null && draft.start === null;
        return { ...state, draft, droppedStart: dropped ? state.draft.start : state.droppedStart };
      }
      case 'selectDate':
        return { ...state, draft: selectDate(state.draft, action.date), droppedStart: null };
      case 'selectStart':
        return { ...state, draft: selectStart(state.draft, action.start), droppedStart: null };
      case 'setDetails':
        return { ...state, details: { ...state.details, ...action.details } };
      case 'reset':
        return initialBookingState(action.stylistId);
    }
  };
}
