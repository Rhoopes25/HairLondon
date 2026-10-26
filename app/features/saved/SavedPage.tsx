import { formatStartingPrice } from '@src/domain/format/price';
import { startingPrice } from '@src/domain/pricing/totals';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { profilePath, queryString } from '@app/lib/links';
import { stylistCardIdentity } from '@app/lib/stylist-card';
import { useAccount, useSavedIds, useStylists } from '@app/services';
import { EmptyNote, LinkButton, PageIntro, StylistCard } from '@app/ui';
import styles from './SavedPage.module.css';

/** Her saved stylists, in the order she saved them. Saving needs an account, so a guest is asked to sign in. */
export function SavedPage() {
  const ids = useSavedIds();
  const stylists = useStylists();
  const account = useAccount();
  useDocumentTitle('Saved stylists');

  const saved = ids
    .map((id) => stylists.find((stylist) => stylist.id === id))
    .filter((stylist) => stylist !== undefined);

  if (!account) {
    return (
      <>
        <PageIntro title="Saved stylists">The ones you want to come back to.</PageIntro>
        <div className={styles.signedOut}>
          <p>Sign in to see your saved stylists, and tap Save on any profile to add one.</p>
          <div className={styles.actions}>
            <LinkButton to={`/account/sign-in${queryString({ back: '/saved' })}`}>
              Sign in
            </LinkButton>
            <LinkButton variant="outline" to={`/account/create${queryString({ back: '/saved' })}`}>
              Create an account
            </LinkButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageIntro title="Saved stylists">The ones you want to come back to.</PageIntro>
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
