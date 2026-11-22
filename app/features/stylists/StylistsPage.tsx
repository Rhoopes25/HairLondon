import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { SAMPLE_LOCATION } from '@src/data/seed/sample-location';
import { firstName } from '@src/domain/format/name';
import { formatStartingPrice } from '@src/domain/format/price';
import type { Stylist } from '@src/domain/models/stylist';
import { startingPrice } from '@src/domain/pricing/totals';
import { activeFilterCount, browseStylists } from '@src/domain/stylists/browse';
import type { BrowseOptions, SortKey } from '@src/domain/stylists/browse';
import { formatDistance, milesBetween } from '@src/domain/stylists/location';
import { searchStylistsByText } from '@src/domain/stylists/text-search';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { profilePath, readBrowse, stylistsSearch } from '@app/lib/links';
import { stylistCardIdentity, stylistPreview, workThumbnails } from '@app/lib/stylist-card';
import { useDistanceOrigin, useMyLocation, useStylists } from '@app/services';
import {
  BookNowBar,
  Button,
  EmptyNote,
  Icon,
  PageIntro,
  StylistCard,
  TextButton,
  TextField,
} from '@app/ui';
import { BrowseControls } from './BrowseControls';
import { useLocateMe } from './useLocateMe';
import styles from './StylistsPage.module.css';

/**
 * Meet the stylists: who they are, their work, and their reviews. This page is for browsing and
 * building trust, so it shows no open times; finding a time is the Book page's job. She can search
 * by name, studio, city, or specialty (typos are fine), sort by nearest or price, narrow by price,
 * distance, and specialty, and open a quick look at any stylist without leaving the list.
 */
export function StylistsPage() {
  const stylists = useStylists();
  const myLocation = useMyLocation();
  const origin = useDistanceOrigin();
  const { status, locate, standInSample, forget } = useLocateMe();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  useDocumentTitle('Stylists');

  const query = searchParams.get('q') ?? '';
  const browse = readBrowse(searchParams);
  const searching = query.trim() !== '';
  const here = `${location.pathname}${location.search}`;

  /** Every tap here changes the link in place: it is a filter, not a new screen. */
  function setState(nextQuery: string, nextBrowse: BrowseOptions) {
    // Replace, so each keystroke is not a step the back button has to undo.
    navigate(
      { pathname: location.pathname, search: stylistsSearch(nextQuery, nextBrowse) },
      { replace: true, preventScrollReset: true },
    );
  }

  const search = searchStylistsByText(stylists, query);
  const found = search.matches.map((match) => match.stylist);
  // Nearest first unless she says otherwise; while searching, the best match first.
  const sort: SortKey = browse.sort ?? (searching ? 'best' : 'nearest');
  const shown = browseStylists(found, { ...browse, sort }, origin);
  const filters = activeFilterCount(browse);
  const distanceTo = (stylist: Stylist) => formatDistance(milesBetween(origin, stylist.location));

  return (
    <>
      <BookNowBar to="/book" />
      <PageIntro title="Stylists" large>
        Meet the local stylists and barbers behind the work, then choose the one you want to book
        with.
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
            onChange={(event) => setState(event.target.value, browse)}
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
            <div className={styles.nearIdle}>
              <Button variant="outline" size="sm" onClick={locate} disabled={status === 'asking'}>
                <Icon name="navigation" className={styles.buttonIcon} />
                {status === 'asking' ? 'Finding you…' : 'Use my location'}
              </Button>
              <p className={styles.originNote}>
                Distances are measured from {SAMPLE_LOCATION.label} for now.
              </p>
            </div>
          )}
        </div>
      </div>

      <BrowseControls
        browse={browse}
        sort={sort}
        searching={searching}
        onChange={(next) => setState(query, next)}
      />

      {searching || filters > 0 ? (
        <p className={styles.result} aria-live="polite">
          {shown.length
            ? search.didYouMean && searching
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
                reviewsTo={profilePath({ stylistId: stylist.id, tab: 'reviews', back: here })}
                price={lowest === null ? null : { value: formatStartingPrice(lowest) }}
                photos={workThumbnails(stylist)}
                seeAll={{
                  to: profile,
                  label: `See all of ${firstName(stylist.name)}’s work, services, and reviews`,
                }}
                preview={stylistPreview(stylist, profile)}
              />
            );
          })}
        </section>
      ) : (
        <div className={styles.none}>
          <EmptyNote>
            {searching
              ? `No stylists match “${query.trim()}”${filters > 0 ? ' with these filters' : ''}. Try a name, a city like Provo, or what you need, like color.`
              : 'No stylists match these filters. Try a wider distance or price.'}
          </EmptyNote>
          {filters > 0 ? (
            <TextButton
              onClick={() =>
                setState(query, {
                  sort: browse.sort,
                  maxPrice: undefined,
                  maxMiles: undefined,
                  area: undefined,
                })
              }
            >
              Clear filters ({filters})
            </TextButton>
          ) : null}
        </div>
      )}
    </>
  );
}
