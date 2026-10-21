import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { SAMPLE_LOCATION } from '@src/data/seed/sample-location';
import { firstName } from '@src/domain/format/name';
import { formatStartingPrice } from '@src/domain/format/price';
import type { Stylist } from '@src/domain/models/stylist';
import { startingPrice } from '@src/domain/pricing/totals';
import { formatDistance, milesBetween, sortByDistance } from '@src/domain/stylists/location';
import { searchStylistsByText } from '@src/domain/stylists/text-search';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { profilePath, queryString } from '@app/lib/links';
import { stylistCardIdentity, workThumbnails } from '@app/lib/stylist-card';
import { useMyLocation, useStylists } from '@app/services';
import { Button, EmptyNote, Icon, PageIntro, StylistCard, TextButton, TextField } from '@app/ui';
import { useLocateMe } from './useLocateMe';
import styles from './StylistsPage.module.css';

/**
 * Meet the stylists: who they are, their work, and their reviews. This page is for browsing and
 * building trust, so it shows no open times; finding a time is the Book page's job. She can search
 * by name, studio, city, or specialty (typos are fine), and sort by how close they are to her.
 */
export function StylistsPage() {
  const stylists = useStylists();
  const myLocation = useMyLocation();
  const { status, locate, standInSample, forget } = useLocateMe();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  useDocumentTitle('Stylists');

  const query = searchParams.get('q') ?? '';
  const here = `${location.pathname}${location.search}`;

  function setQuery(next: string) {
    // Replace, so each keystroke is not a step the back button has to undo.
    navigate(
      { pathname: location.pathname, search: queryString({ q: next || undefined }) },
      { replace: true, preventScrollReset: true },
    );
  }

  const search = searchStylistsByText(stylists, query);
  const found = search.matches.map((match) => match.stylist);
  // With no search, nearest first. With one, best match first; distance is still on each card.
  const shown = myLocation && !query.trim() ? sortByDistance(found, myLocation) : found;
  const distanceTo = (stylist: Stylist) =>
    myLocation ? formatDistance(milesBetween(myLocation, stylist.location)) : null;

  return (
    <>
      <PageIntro title="Stylists">
        Meet the local stylists behind the work, then choose the one you want to book with.
      </PageIntro>

      <div className={styles.tools}>
        <form className={styles.search} role="search" onSubmit={(event) => event.preventDefault()}>
          <TextField
            label="Search stylists"
            type="search"
            name="q"
            autoComplete="off"
            placeholder="A name, a city, or a service like color"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>

        <div className={styles.near}>
          {myLocation ? (
            <p className={styles.nearText}>
              <Icon name="navigation" />
              <span>
                {myLocation.source === 'device'
                  ? 'Showing how far each stylist is from you.'
                  : `You look far from our stylists, so for this prototype we’re measuring from ${SAMPLE_LOCATION.label}.`}{' '}
                <TextButton onClick={forget}>Stop using location</TextButton>
              </span>
            </p>
          ) : status === 'unavailable' ? (
            <div className={styles.nearText} role="status">
              <Icon name="navigation" />
              <span>
                We couldn&rsquo;t get your location. That&rsquo;s fine: you can still browse
                everyone.{' '}
                <TextButton onClick={standInSample}>Use a sample spot in Provo</TextButton>
              </span>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={locate} disabled={status === 'asking'}>
              <Icon name="navigation" className={styles.buttonIcon} />
              {status === 'asking' ? 'Finding you…' : 'Use my location'}
            </Button>
          )}
        </div>
      </div>

      {query.trim() ? (
        <p className={styles.result} aria-live="polite">
          {shown.length
            ? search.didYouMean
              ? `Showing results for “${search.didYouMean}”`
              : `${shown.length} ${shown.length === 1 ? 'stylist' : 'stylists'} found`
            : ''}
        </p>
      ) : null}

      {shown.length ? (
        <section className={styles.list} aria-label="Stylists">
          {shown.map((stylist) => {
            const lowest = startingPrice(stylist);
            const profile = profilePath({ stylistId: stylist.id, back: here });
            return (
              <StylistCard
                key={stylist.id}
                to={profile}
                {...stylistCardIdentity(stylist)}
                distance={distanceTo(stylist)}
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
      ) : (
        <EmptyNote>
          No stylists match &ldquo;{query.trim()}&rdquo;. Try a name, a city like Provo, or what you
          need, like color.
        </EmptyNote>
      )}
    </>
  );
}
