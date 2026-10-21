import { Navigate, Outlet, useParams, useSearchParams } from 'react-router';
import { useStylist } from '@app/services';
import { profilePath, readDate, readServiceIds, readStart, safeBackPath } from '@app/lib/links';
import { BookingProvider } from './BookingProvider';

/** Parent route for every booking step. Unknown stylist: back to the list. */
export function BookingFlow() {
  const { id } = useParams();
  const stylist = useStylist(id);
  const [searchParams] = useSearchParams();

  if (!stylist) return <Navigate to="/stylists" replace />;

  // A link can bring services, and a day and time she already chose (a time tapped on the Book
  // page arrives held), plus where the X should go. The provider checks all of it against what
  // this stylist really offers and has open.
  const serviceIds = readServiceIds(searchParams);
  const preset = { serviceIds, date: readDate(searchParams), start: readStart(searchParams) };
  const exitTo = safeBackPath(
    searchParams.get('back'),
    profilePath({ stylistId: stylist.id, serviceIds }),
  );

  return (
    <BookingProvider stylist={stylist} preset={preset} exitTo={exitTo}>
      <Outlet />
    </BookingProvider>
  );
}
