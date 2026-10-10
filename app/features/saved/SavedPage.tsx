import { averageRating } from '@src/domain/format/rating';
import { startingPrice } from '@src/domain/pricing/totals';
import { assetUrl, photoSrcSet } from '@app/config';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useSavedIds, useStylists } from '@app/services';
import { EmptyNote, LinkButton, PageIntro, StylistCard } from '@app/ui';
import styles from './SavedPage.module.css';

/** Stylists the client saved to come back to, in the order they saved them. */
export function SavedPage() {
  const ids = useSavedIds();
  const stylists = useStylists();
  useDocumentTitle('Saved stylists');

  const saved = ids
    .map((id) => stylists.find((stylist) => stylist.id === id))
    .filter((stylist) => stylist !== undefined);

  return (
    <>
      <PageIntro title="Saved stylists">The ones you want to come back to.</PageIntro>

      {saved.length === 0 ? (
        <>
          <EmptyNote>
            Nobody saved yet. Tap Save on a stylist&rsquo;s profile and she&rsquo;ll be here.
          </EmptyNote>
          <div className={styles.cta}>
            <LinkButton to="/stylists">Find a stylist</LinkButton>
          </div>
        </>
      ) : (
        <div className={styles.list}>
          {saved.map((stylist) => {
            const price = startingPrice(stylist);
            return (
              <StylistCard
                key={stylist.id}
                to={`/stylists/${stylist.id}`}
                name={stylist.name}
                photoUrl={stylist.photo ? assetUrl(stylist.photo) : null}
                photoSrcSet={stylist.photo ? photoSrcSet(stylist.photo) : undefined}
                studio={stylist.studio}
                city={stylist.city}
                average={averageRating(stylist.reviews)}
                reviewCount={stylist.reviews.length}
                priceText={price === null ? null : `From $${price}`}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
