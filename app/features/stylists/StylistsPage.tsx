import { formatStartingPrice } from '@src/domain/format/price';
import { startingPrice } from '@src/domain/pricing/totals';
import { searchStylists } from '@src/domain/stylists/book-search';
import { openingChips } from '@app/features/scheduling';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { profilePath } from '@app/lib/links';
import { stylistCardIdentity, workThumbnails } from '@app/lib/stylist-card';
import { useSearchEnvironment, useStylists } from '@app/services';
import { PageIntro, QuietLink, StylistCard } from '@app/ui';
import styles from './StylistsPage.module.css';

/**
 * Meet the stylists: their work, their reviews, and their next open times, all on one card.
 * Searching by service, day, and time is the Book page's job; this is for browsing.
 */
export function StylistsPage() {
  const stylists = useStylists();
  const env = useSearchEnvironment();
  useDocumentTitle('Stylists');

  const openingsById = new Map(
    searchStylists(stylists, { serviceIds: [] }, env).matches.map((match) => [
      match.stylist.id,
      match.openings,
    ]),
  );

  return (
    <>
      <PageIntro title="Stylists">
        Meet the local stylists behind the work, then choose the one you want to book with.
      </PageIntro>

      <section className={styles.list} aria-label="Stylists">
        {stylists.map((stylist) => {
          const openings = openingsById.get(stylist.id) ?? [];
          const lowest = startingPrice(stylist);
          return (
            <StylistCard
              key={stylist.id}
              to={profilePath({ stylistId: stylist.id, back: '/stylists' })}
              {...stylistCardIdentity(stylist)}
              price={lowest === null ? null : { note: 'from', value: formatStartingPrice(lowest) }}
              photos={workThumbnails(stylist)}
              slots={
                openings.length
                  ? {
                      heading: 'Next open',
                      items: openingChips(stylist, openings, {
                        clock: env.clock,
                        serviceIds: [],
                        back: '/stylists',
                      }),
                    }
                  : undefined
              }
              footer={
                <QuietLink to={profilePath({ stylistId: stylist.id, back: '/stylists' })}>
                  View profile
                </QuietLink>
              }
            />
          );
        })}
      </section>
    </>
  );
}
