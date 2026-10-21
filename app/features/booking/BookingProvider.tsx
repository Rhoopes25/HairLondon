import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import { createBookingReducer, initialBookingState } from '@src/domain/booking/booking-state';
import type { BookingState } from '@src/domain/booking/booking-state';
import { presetDraft } from '@src/domain/booking/draft';
import type { DraftPreset } from '@src/domain/booking/draft';
import type { ServiceId } from '@src/domain/models/service';
import type { Stylist } from '@src/domain/models/stylist';
import type { IsoDate, MinuteOfDay } from '@src/domain/models/time';
import type { DetailsInput } from '@src/domain/booking/validate-details';
import { useAccount, useServices } from '@app/services';

interface BookingContextValue extends BookingState {
  stylist: Stylist;
  /** Where the X goes: the search or profile she came from. */
  exitTo: string;
  /** She came in with services already picked, so step 1 shows them as one line. */
  arrivedWithServices: boolean;
  toggleService: (id: ServiceId) => void;
  selectDate: (date: IsoDate) => void;
  selectStart: (start: MinuteOfDay) => void;
  setDetails: (details: Partial<DetailsInput>) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

/** Holds one booking in progress. It lives across the steps because the steps are child routes of the same parent. */
export function BookingProvider({
  stylist,
  preset,
  exitTo,
  children,
}: {
  stylist: Stylist;
  preset?: DraftPreset;
  exitTo: string;
  children: ReactNode;
}) {
  const { clock, catalog, availabilityFor } = useServices();
  const account = useAccount();

  const reducer = useMemo(
    () =>
      createBookingReducer({
        context: { strategy: availabilityFor(), clock, stylistId: stylist.id },
        catalog,
      }),
    [availabilityFor, clock, catalog, stylist.id],
  );
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const initial = initialBookingState(
      stylist.id,
      presetDraft(
        stylist,
        preset ?? {},
        { strategy: availabilityFor(), clock, stylistId: stylist.id },
        catalog,
      ),
    );
    // Signed in already: her saved details are there from the start, with no empty flash.
    return account
      ? { ...initial, details: { name: account.name, phone: account.phone } }
      : initial;
  });
  // Decided once, on arrival: later toggles must not make the summary line appear or vanish.
  const [arrivedWithServices] = useState(() => state.draft.serviceIds.length > 0);

  const toggleService = useCallback((id: ServiceId) => dispatch({ type: 'toggleService', id }), []);
  const selectDate = useCallback((date: IsoDate) => dispatch({ type: 'selectDate', date }), []);
  const selectStart = useCallback(
    (start: MinuteOfDay) => dispatch({ type: 'selectStart', start }),
    [],
  );
  const setDetails = useCallback(
    (details: Partial<DetailsInput>) => dispatch({ type: 'setDetails', details }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: 'reset', stylistId: stylist.id }), [stylist.id]);

  const value = useMemo(
    () => ({
      ...state,
      stylist,
      exitTo,
      arrivedWithServices,
      toggleService,
      selectDate,
      selectStart,
      setDetails,
      reset,
    }),
    [
      state,
      stylist,
      exitTo,
      arrivedWithServices,
      toggleService,
      selectDate,
      selectStart,
      setDetails,
      reset,
    ],
  );
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used inside a booking flow');
  return context;
}
