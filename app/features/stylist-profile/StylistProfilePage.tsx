import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { presetDraft } from '@src/domain/booking/draft';
import { formatDay } from '@src/domain/format/date';
import { formatDuration } from '@src/domain/format/duration';
import { firstName } from '@src/domain/format/name';
import { formatStartingPrice } from '@src/domain/format/price';
import { averageRating } from '@src/domain/format/rating';
import { formatTime } from '@src/domain/format/time';
import { SERVICE_IDS } from '@src/domain/models/service';
import type { ServiceId } from '@src/domain/models/service';
import { startingPrice, totalDuration, totalPrice } from '@src/domain/pricing/totals';
import { formatDistance, milesBetween } from '@src/domain/stylists/location';
import { assetUrl, photoSrcSet } from '@app/config';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { bookingPath, readDate, readServiceIds, readStart, safeBackPath } from '@app/lib/links';
import { useMyLocation, useServices, useStylist } from '@app/services';
import {
  BackLink,
  BookBar,
  EmptyNote,
  PortfolioGrid,
  ProfileHeader,
  QuietLink,
  Reviews,
  ServiceRow,
  TabRow,
  Tabs,
} from '@app/ui';
import { AboutMePanel } from './AboutMePanel';
import { SaveButton } from './SaveButton';
import { ServiceDetailSheet } from './ServiceDetailSheet';
import styles from './StylistProfilePage.module.css';

const TABS = ['portfolio', 'services', 'reviews', 'about-me'] as const;
type Tab = (typeof TABS)[number];

function isTab(value: string | undefined): value is Tab {
  return TABS.includes(value as Tab);
}

/** Says where the link goes, so she knows what she is returning to. */
function backLabelFor(path: string): string {
  if (path.startsWith('/book')) return 'Back to your search';
  if (path.startsWith('/saved')) return 'Back to saved stylists';
  return 'Back to stylists';
}

export function StylistProfilePage() {
  const { id, tab } = useParams();
  const stylist = useStylist(id);
  const { catalog, clock, availabilityFor } = useServices();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [detailService, setDetailService] = useState<ServiceId | null>(null);
  const myLocation = useMyLocation();
  useDocumentTitle(stylist?.name ?? 'Stylist');

  if (!stylist) return <Navigate to="/stylists" replace />;
  if (tab !== undefined && !isTab(tab)) return <Navigate to={`/stylists/${stylist.id}`} replace />;

  const base = `/stylists/${stylist.id}`;
  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';
  // Lead with the work, because that is what builds trust. Reviews first if there are no photos yet.
  const current: Tab = tab ?? (stylist.portfolio.length ? 'portfolio' : 'reviews');
  const first = firstName(stylist.name);

  // What she chose before arriving (services, a day, maybe a held time), checked against what
  // this stylist really offers and has open, so the Book bar never promises something stale.
  const chosen = presetDraft(
    stylist,
    {
      serviceIds: readServiceIds(searchParams),
      date: readDate(searchParams),
      start: readStart(searchParams),
    },
    { strategy: availabilityFor(), clock, stylistId: stylist.id },
    catalog,
  );
  const picked = chosen.serviceIds.length > 0;

  const backTo = safeBackPath(searchParams.get('back'), '/stylists');
  const backLabel = backLabelFor(backTo);
  // The X in booking returns here, to this exact view of the profile.
  const here = `${location.pathname}${location.search}`;
  const bookTo = bookingPath({
    stylistId: stylist.id,
    serviceIds: chosen.serviceIds,
    date: chosen.date,
    start: chosen.start,
    back: here,
  });

  return (
    <>
      <BackLink to={backTo}>{backLabel}</BackLink>
      <ProfileHeader
        name={stylist.name}
        photoUrl={stylist.photo ? assetUrl(stylist.photo) : null}
        photoSrcSet={stylist.photo ? photoSrcSet(stylist.photo) : undefined}
        studio={stylist.studio}
        city={stylist.city}
        average={averageRating(stylist.reviews)}
        reviewCount={stylist.reviews.length}
        bio={stylist.bio}
        aside={<SaveButton stylist={stylist} />}
      >
        <Tabs
          value={current}
          onValueChange={(next) => navigate(`${base}/${next}${search}`, { replace: true })}
        >
          <TabRow>
            <Tabs.List label="Profile sections">
              <Tabs.Tab value="portfolio">Portfolio</Tabs.Tab>
              <Tabs.Tab value="services">Services</Tabs.Tab>
              <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
              <Tabs.Tab value="about-me">About me</Tabs.Tab>
            </Tabs.List>
          </TabRow>

          <Tabs.Panel value="portfolio">
            {stylist.portfolio.length ? (
              <PortfolioGrid
                photos={stylist.portfolio.map((photo) => ({
                  src: assetUrl(photo.src),
                  srcSet: photoSrcSet(photo.src),
                  alt: photo.alt,
                }))}
                onSelect={(index) => navigate(`${base}/photos/${index}`)}
              />
            ) : (
              <EmptyNote>
                {first} hasn&rsquo;t added photos yet. Check the reviews to see what clients say.
              </EmptyNote>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="services">
            <p className={styles.priceNote}>
              Prices are starting points. Longer or thicker hair can cost more, and times are
              estimates.
            </p>
            <div className={styles.services}>
              {SERVICE_IDS.filter((sid) => stylist.prices[sid] !== undefined).map((sid) => (
                <ServiceRow
                  key={sid}
                  // Tapping a service adds it to what she already picked. The held time is left
                  // behind, because a longer visit may not fit it.
                  to={bookingPath({
                    stylistId: stylist.id,
                    serviceIds: chosen.serviceIds.includes(sid)
                      ? chosen.serviceIds
                      : [...chosen.serviceIds, sid],
                    date: chosen.date,
                    back: here,
                  })}
                  name={catalog[sid].name}
                  description={catalog[sid].description}
                  meta={`${formatDuration(catalog[sid].durationMin)} · ${formatStartingPrice(stylist.prices[sid] ?? 0)}`}
                  onInfo={() => setDetailService(sid)}
                />
              ))}
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="reviews">
            <Reviews
              reviews={stylist.reviews}
              average={averageRating(stylist.reviews)}
              action={
                <p className={styles.reviewNote}>
                  Reviews come from clients after their visit. Booked with {first} before? Open the
                  visit in <QuietLink to="/appointments">My appointments</QuietLink> to review it.
                </p>
              }
            />
          </Tabs.Panel>

          <Tabs.Panel value="about-me">
            <AboutMePanel
              stylist={stylist}
              distance={
                myLocation ? formatDistance(milesBetween(myLocation, stylist.location)) : null
              }
            />
          </Tabs.Panel>
        </Tabs>
      </ProfileHeader>

      <p className={styles.about}>
        <QuietLink to={`${base}/about`}>About {stylist.studio}</QuietLink>
      </p>

      <BookBar
        title={
          picked
            ? chosen.serviceIds.map((sid) => catalog[sid].name).join(' + ')
            : `Services from ${formatStartingPrice(startingPrice(stylist) ?? 0)}`
        }
        meta={
          picked
            ? `${formatStartingPrice(totalPrice(stylist, chosen.serviceIds))} · about ${formatDuration(totalDuration(catalog, chosen.serviceIds))}`
            : 'Pick services, a day, and a time next'
        }
        heldTime={
          picked && chosen.date !== null && chosen.start !== null
            ? `${formatDay(chosen.date)} at ${formatTime(chosen.start)}`
            : null
        }
        to={bookTo}
        label={`Book with ${first}`}
      />

      <ServiceDetailSheet
        stylist={stylist}
        serviceId={detailService}
        onClose={() => setDetailService(null)}
      />
    </>
  );
}
