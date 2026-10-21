import { formatStartingPrice } from '@src/domain/format/price';
import { startingPrice } from '@src/domain/pricing/totals';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { profilePath } from '@app/lib/links';
import { stylistCardIdentity } from '@app/lib/stylist-card';
import { useAccount, useSavedIds, useStylists } from '@app/services';
import { EmptyNote, LinkButton, PageIntro, QuietLink, StylistCard } from '@app/ui';
import styles from './SavedPage.module.css';

/** Stylists the client saved to come back to, in the order they saved them. */
export function SavedPage() {
  const ids = useSavedIds();
  const stylists = useStylists();
  const account = useAccount();
  useDocumentTitle('Saved stylists');

  const saved = ids
    .map((id) => stylists.find((stylist) => stylist.id === id))
    .filter((stylist) => stylist !== undefined);

  return (
    <>
      <PageIntro title="Saved stylists">The ones you want to come back to.</PageIntro>
      {account ? null : (
        <p className={styles.signIn}>
          Ready to book one? <QuietLink to="/account">Sign in</QuietLink> and your details fill in
          for you.
        </p>
      )}

      {saved.length === 0 ? (
        <>
          <EmptyNote>
            Nobody saved yet. Tap Save on a stylist&rsquo;s profile and she&rsquo;ll be here.
          </EmptyNote>
          <div className={styles.cta}>
            <LinkButton to="/book">Find a stylist</LinkButton>
          </div>
        </>
      ) : (
        <div className={styles.list}>
          {saved.map((stylist) => {
            const lowest = startingPrice(stylist);
            return (
              <StylistCard
                key={stylist.id}
                to={profilePath({ stylistId: stylist.id, back: '/saved' })}
                {...stylistCardIdentity(stylist)}
                price={lowest === null ? null : { value: formatStartingPrice(lowest) }}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
