import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { createBookingReducer, initialBookingState } from '@src/domain/booking/booking-state';
import type { BookingState } from '@src/domain/booking/booking-state';
import type { ServiceId } from '@src/domain/models/service';
import type { Stylist } from '@src/domain/models/stylist';
import type { IsoDate, MinuteOfDay } from '@src/domain/models/time';
import type { DetailsInput } from '@src/domain/booking/validate-details';
import { useServices } from '@app/services';

interface BookingContextValue extends BookingState {
  stylist: Stylist;
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
  presetService,
  children,
}: {
  stylist: Stylist;
  presetService?: ServiceId;
  children: ReactNode;
}) {
  const { clock, catalog, availabilityFor } = useServices();

  const reducer = useMemo(
    () =>
      createBookingReducer({
        context: { strategy: availabilityFor(), clock, stylistId: stylist.id },
        catalog,
      }),
    [availabilityFor, clock, catalog, stylist.id],
  );
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initialBookingState(stylist.id, presetService),
  );

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
    () => ({ ...state, stylist, toggleService, selectDate, selectStart, setDetails, reset }),
    [state, stylist, toggleService, selectDate, selectStart, setDetails, reset],
  );
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used inside a booking flow');
  return context;
}
