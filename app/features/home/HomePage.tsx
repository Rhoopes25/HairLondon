import { latestBooking, nextVisit } from '@src/domain/account/account';
import type { Appointment } from '@src/domain/models/appointment';
import type { ServiceCatalog } from '@src/domain/models/service';
import { assetUrl, photoSrcSet } from '@app/config';
import { NextVisitCard } from '@app/features/account';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { bookingPath } from '@app/lib/links';
import { useAccount, useAppointments, useServices, useStylist } from '@app/services';
import { Hero, QuietLink } from '@app/ui';
import type { HeroAction } from '@app/ui';

/**
 * The entry screen. The first and biggest thing says what this is for (local stylists you can
 * trust, with real work to look at). Two ways in sit under it, and only one is filled, so they
 * never compete. Which one leads depends on where she is with trust:
 *
 * - Never booked (a guest, or signed in with no visits): Explore Stylists leads, because she
 *   won't book someone she hasn't seen work from. Book Now stays one tap away for anyone who
 *   already trusts a stylist.
 * - Booked before: she already trusts someone, so Book Again leads and opens booking with the
 *   same stylist and services, exactly like "Book again" on a past visit.
 *
 * Under the buttons, at most one quiet thing: her next visit if one is coming up, or a link to
 * her past visits. Nothing at all when she has never booked.
 */
export function HomePage() {
  const account = useAccount();
  const appointments = useAppointments();
  const { catalog, clock } = useServices();
  const last = account ? latestBooking(account, appointments) : null;
  const upcoming = account ? nextVisit(account, appointments, clock) : null;
  const stylist = useStylist(last?.stylistId);
  useDocumentTitle('Find a stylist you trust');

  const actions: HeroAction[] = last
    ? [
        bookAgain(last, describeVisit(last, catalog, stylist?.name)),
        { label: 'Explore Stylists', to: '/stylists', variant: 'outline' },
      ]
    : [
        { label: 'Explore Stylists', to: '/stylists' },
        { label: 'Book Now', to: '/book', variant: 'outline' },
      ];

  return (
    <Hero
      imageUrl={assetUrl('images/home.jpg')}
      imageSrcSet={photoSrcSet('images/home.jpg')}
      imageLabel="A stylist holding her shears"
      title="Local Locks"
      tagline="Local stylists you can trust."
      actions={actions}
      extra={
        account && upcoming ? (
          <NextVisitCard account={account} />
        ) : last ? (
          <QuietLink to="/appointments">See past visits</QuietLink>
        ) : undefined
      }
    />
  );
}

function bookAgain(visit: Appointment, what: string): HeroAction {
  return {
    label: 'Book Again',
    ariaLabel: `Book again: ${what}`,
    to: bookingPath({ stylistId: visit.stylistId, serviceIds: visit.serviceIds, back: '/' }),
  };
}

function describeVisit(
  visit: Appointment,
  catalog: ServiceCatalog,
  stylistName: string | undefined,
): string {
  const services = visit.serviceIds.map((id) => catalog[id].name).join(' + ');
  return `${services} with ${stylistName ?? 'your stylist'}`;
}
