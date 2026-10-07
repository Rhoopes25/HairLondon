import { Navigate, Outlet, useParams, useSearchParams } from 'react-router';
import { isServiceId } from '@src/domain/models/service';
import { offersService } from '@src/domain/pricing/totals';
import { useStylist } from '@app/services';
import { BookingProvider } from './BookingProvider';

/** Parent route for every booking step. Unknown stylist: back to the list. */
export function BookingFlow() {
  const { id } = useParams();
  const stylist = useStylist(id);
  const [searchParams] = useSearchParams();

  if (!stylist) return <Navigate to="/stylists" replace />;

  // A service row on the profile links here with ?service=color so it arrives already chosen.
  const requested = searchParams.get('service');
  const presetService =
    isServiceId(requested) && offersService(stylist, requested) ? requested : undefined;

  return (
    <BookingProvider stylist={stylist} presetService={presetService}>
      <Outlet />
    </BookingProvider>
  );
}
