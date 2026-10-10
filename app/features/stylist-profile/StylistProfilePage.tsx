import { useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { averageRating } from '@src/domain/format/rating';
import { firstName } from '@src/domain/format/name';
import { formatDuration } from '@src/domain/format/duration';
import { SERVICE_IDS } from '@src/domain/models/service';
import type { ServiceId } from '@src/domain/models/service';
import { assetUrl, photoSrcSet } from '@app/config';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useServices, useStylist } from '@app/services';
import {
  EmptyNote,
  LinkButton,
  PortfolioGrid,
  ProfileHeader,
  QuietLink,
  Reviews,
  ServiceRow,
  TabRow,
  Tabs,
} from '@app/ui';
import { SaveButton } from './SaveButton';
import { ServiceDetailSheet } from './ServiceDetailSheet';
import styles from './StylistProfilePage.module.css';

const TABS = ['portfolio', 'services', 'reviews'] as const;
type Tab = (typeof TABS)[number];

function isTab(value: string | undefined): value is Tab {
  return TABS.includes(value as Tab);
}

export function StylistProfilePage() {
  const { id, tab } = useParams();
  const stylist = useStylist(id);
  const { catalog } = useServices();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [detailService, setDetailService] = useState<ServiceId | null>(null);
  useDocumentTitle(stylist?.name ?? 'Stylist');

  if (!stylist) return <Navigate to="/stylists" replace />;
  if (tab !== undefined && !isTab(tab)) return <Navigate to={`/stylists/${stylist.id}`} replace />;

  const base = `/stylists/${stylist.id}`;
  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';
  // Lead with the work. Open on Services instead when she came from a service filter,
  // or when there are no photos yet.
  const current: Tab =
    tab ?? (searchParams.get('service') || !stylist.portfolio.length ? 'services' : 'portfolio');
  const first = firstName(stylist.name);
  const bookTo = `/book/${stylist.id}`;
  const preset = searchParams.get('service');

  return (
    <>
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
            </Tabs.List>
            <LinkButton to={preset ? `${bookTo}?service=${preset}` : bookTo} size="sm">
              Book
            </LinkButton>
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
            <div className={styles.services}>
              {SERVICE_IDS.filter((sid) => stylist.prices[sid] !== undefined).map((sid) => (
                <ServiceRow
                  key={sid}
                  to={`${bookTo}?service=${sid}`}
                  name={catalog[sid].name}
                  description={catalog[sid].description}
                  meta={`${formatDuration(catalog[sid].durationMin)} · $${stylist.prices[sid]}`}
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
        </Tabs>
      </ProfileHeader>

      <div className={styles.cta}>
        <LinkButton to={bookTo} fullWidth>
          Book with {first}
        </LinkButton>
        <QuietLink to={`${base}/about`}>About {stylist.studio}</QuietLink>
      </div>

      <ServiceDetailSheet
        stylist={stylist}
        serviceId={detailService}
        onClose={() => setDetailService(null)}
      />
    </>
  );
}
