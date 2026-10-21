import { firstName } from '@src/domain/format/name';
import { formatStartingPrice } from '@src/domain/format/price';
import { startingPrice } from '@src/domain/pricing/totals';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { profilePath } from '@app/lib/links';
import { stylistCardIdentity, workThumbnails } from '@app/lib/stylist-card';
import { useStylists } from '@app/services';
import { PageIntro, StylistCard } from '@app/ui';
import styles from './StylistsPage.module.css';

/**
 * Meet the stylists: who they are, their work, and their reviews. This page is for browsing and
 * building trust, so it shows no open times; finding a time is the Book page's job.
 */
export function StylistsPage() {
  const stylists = useStylists();
  useDocumentTitle('Stylists');

  return (
    <>
      <PageIntro title="Stylists">
        Meet the local stylists behind the work, then choose the one you want to book with.
      </PageIntro>

      <section className={styles.list} aria-label="Stylists">
        {stylists.map((stylist) => {
          const lowest = startingPrice(stylist);
          const profile = profilePath({ stylistId: stylist.id, back: '/stylists' });
          return (
            <StylistCard
              key={stylist.id}
              to={profile}
              {...stylistCardIdentity(stylist)}
              price={lowest === null ? null : { value: formatStartingPrice(lowest) }}
              photos={workThumbnails(stylist)}
              seeAll={{
                to: profile,
                label: `See all of ${firstName(stylist.name)}’s work, services, and reviews`,
              }}
            />
          );
        })}
      </section>
    </>
  );
}
