import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { averageRating } from '@src/domain/format/rating';
import { isServiceId, SERVICE_IDS } from '@src/domain/models/service';
import type { ServiceId } from '@src/domain/models/service';
import type { Weekday } from '@src/domain/models/time';
import { startingPrice } from '@src/domain/pricing/totals';
import { filterStylists, parseWeekday, WEEKDAY_NAMES } from '@src/domain/stylists/filter';
import { assetUrl } from '@app/config';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useServices, useStylists } from '@app/services';
import { Button, Chip, ChipRow, EmptyNote, PageIntro, StylistCard, TextButton } from '@app/ui';
import { FilterSheet } from './FilterSheet';
import styles from './StylistsPage.module.css';

export function StylistsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { catalog } = useServices();
  const stylists = useStylists();
  const [filtering, setFiltering] = useState(false);
  useDocumentTitle('Find a stylist');

  // The URL is the source of truth, so the filter survives refresh and can be shared.
  const requested = searchParams.get('service');
  const service: ServiceId | undefined = isServiceId(requested) ? requested : undefined;
  const weekday = parseWeekday(searchParams.get('day'));

  function update(next: { service?: ServiceId | undefined; weekday?: Weekday | undefined }) {
    const params = new URLSearchParams();
    if (next.service) params.set('service', next.service);
    if (next.weekday !== undefined) params.set('day', String(next.weekday));
    setSearchParams(params, { replace: true });
  }

  const matches = filterStylists(stylists, { service, weekday });

  return (
    <>
      <PageIntro title="Find a stylist">
        Browse their work and reviews, then book a time that fits your day.
      </PageIntro>

      <section className={styles.filters} aria-label="Filter stylists">
        <ChipRow label="Service">
          <Chip selected={service === undefined} onClick={() => update({ weekday })}>
            All services
          </Chip>
          {SERVICE_IDS.map((id) => (
            <Chip
              key={id}
              selected={service === id}
              onClick={() => update({ service: id, weekday })}
            >
              {catalog[id].name}
            </Chip>
          ))}
        </ChipRow>
        <div className={styles.dayRow}>
          <Button variant="outline" size="sm" onClick={() => setFiltering(true)}>
            {weekday === undefined ? 'Which day can you come?' : `Works ${WEEKDAY_NAMES[weekday]}s`}
          </Button>
          {weekday !== undefined ? (
            <TextButton onClick={() => update({ service })}>Clear day</TextButton>
          ) : null}
        </div>
      </section>

      <section className={styles.list} aria-live="polite" aria-label="Stylists">
        {matches.length === 0 ? (
          <EmptyNote>No stylists match that. Try a different service or day.</EmptyNote>
        ) : (
          matches.map((stylist) => {
            const price = service ? stylist.prices[service] : startingPrice(stylist);
            const priceText =
              price === undefined || price === null
                ? null
                : service
                  ? `${catalog[service].name} $${price}`
                  : `From $${price}`;
            return (
              <StylistCard
                key={stylist.id}
                to={`/stylists/${stylist.id}${service ? `?service=${service}` : ''}`}
                name={stylist.name}
                photoUrl={stylist.photo ? assetUrl(stylist.photo) : null}
                studio={stylist.studio}
                city={stylist.city}
                average={averageRating(stylist.reviews)}
                reviewCount={stylist.reviews.length}
                priceText={priceText}
              />
            );
          })
        )}
      </section>

      <FilterSheet
        key={String(filtering)}
        open={filtering}
        onClose={() => setFiltering(false)}
        weekday={weekday}
        matchCount={(day) => filterStylists(stylists, { service, weekday: day }).length}
        onChange={(day) => update({ service, weekday: day })}
      />
    </>
  );
}
