import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { dayParts, formatDay } from '@src/domain/format/date';
import { formatDuration } from '@src/domain/format/duration';
import { firstName } from '@src/domain/format/name';
import { formatStartingPrice } from '@src/domain/format/price';
import { SERVICE_IDS } from '@src/domain/models/service';
import type { ServiceId } from '@src/domain/models/service';
import { isIsoDate } from '@src/domain/models/time';
import type { IsoDate } from '@src/domain/models/time';
import { startingPrice, totalPrice } from '@src/domain/pricing/totals';
import { isTimeOfDay, TIME_OF_DAY_IDS, TIMES_OF_DAY } from '@src/domain/scheduling/search';
import type { TimeOfDay } from '@src/domain/scheduling/search';
import {
  isTimed,
  searchableDays,
  searchStylists,
  visitLength,
} from '@src/domain/stylists/book-search';
import type { StylistMatch } from '@src/domain/stylists/book-search';
import { formatDistance, milesBetween } from '@src/domain/stylists/location';
import { serviceIdsParam } from '@src/domain/stylists/filter';
import { openingChips } from '@app/features/scheduling';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { profilePath, queryString, readServiceIds } from '@app/lib/links';
import { stylistCardIdentity, workThumbnails } from '@app/lib/stylist-card';
import { useMyLocation, useSearchEnvironment, useStylists } from '@app/services';
import {
  Button,
  Chip,
  ChipRow,
  EmptyNote,
  Narrow,
  Notice,
  PageIntro,
  Section,
  SlotPicker,
  StepGuide,
  StylistCard,
  TextButton,
} from '@app/ui';
import type { DayOption, GuideStep } from '@app/ui';
import styles from './BookPage.module.css';

const GUIDE: readonly GuideStep[] = [
  { label: 'Pick services', icon: 'scissors' },
  { label: 'Pick a day', icon: 'calendar' },
  { label: 'Tap a stylist’s time', icon: 'clock' },
];

/** `?step=who` is part 2, the stylists who can fit her in. Without it she is on part 1, choosing. */
const RESULTS_STEP = 'who';

interface Filters {
  serviceIds: ServiceId[];
  day: IsoDate | undefined;
  timeOfDay: TimeOfDay | undefined;
}

/**
 * Book, in two parts so there is one decision on screen at a time. Part 1: say what you need and,
 * optionally, when. Part 2: the stylists who can fit you in, under a summary of what she picked
 * with an Edit link back to part 1. Everything, including which part she is on, lives in the URL,
 * so a refresh, the back button, and "Back to your search" from a profile all return here exactly
 * as she left it. Each result's open times start a booking with that time held.
 */
export function BookPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stylists = useStylists();
  const env = useSearchEnvironment();
  const myLocation = useMyLocation();
  useDocumentTitle('Book');

  const days = searchableDays(env.clock, stylists);
  const requestedDay = searchParams.get('day');
  const requestedTime = searchParams.get('time');
  const showingResults = searchParams.get('step') === RESULTS_STEP;
  const filters: Filters = {
    serviceIds: readServiceIds(searchParams),
    // A day outside the strip (an old or typed link) is simply ignored.
    day: isIsoDate(requestedDay) && days.includes(requestedDay) ? requestedDay : undefined,
    timeOfDay: isTimeOfDay(requestedTime) ? requestedTime : undefined,
  };

  function searchFor(next: Filters, step?: string) {
    return queryString({
      services: next.serviceIds.length ? serviceIdsParam(next.serviceIds) : undefined,
      day: next.day,
      time: next.timeOfDay,
      step,
    });
  }

  function update(next: Filters) {
    // Replace, not push: every tap on a filter would otherwise be a step the back button must undo.
    // Keep her place on the page: a filter tap is not a new screen, so it must not scroll to the top.
    navigate(
      { pathname: location.pathname, search: searchFor(next) },
      { replace: true, preventScrollReset: true },
    );
  }

  function showResults() {
    // Push, so the back button from part 2 returns to part 1 with her picks still there.
    navigate({ pathname: location.pathname, search: searchFor(filters, RESULTS_STEP) });
  }

  function toggleService(id: ServiceId) {
    const picked = new Set(filters.serviceIds);
    if (!picked.delete(id)) picked.add(id);
    // Keep the catalog's order so the same picks always make the same link.
    update({ ...filters, serviceIds: SERVICE_IDS.filter((existing) => picked.has(existing)) });
  }

  const outcome = searchStylists(stylists, filters, env);
  const timed = isTimed(filters);
  const activeCount =
    filters.serviceIds.length + (filters.day ? 1 : 0) + (filters.timeOfDay ? 1 : 0);
  // Where the X and the back link on the next screens return to: this search as it is now.
  const here = `${location.pathname}${location.search}`;

  const dayOptions: DayOption[] = days.map((date) => ({
    id: date,
    ...dayParts(date),
    label: formatDay(date),
  }));

  function card(match: StylistMatch, slotsHeading: string) {
    const { stylist } = match;
    const ids = filters.serviceIds;
    const lowest = startingPrice(stylist);
    const profile = profilePath({
      stylistId: stylist.id,
      serviceIds: ids,
      date: filters.day,
      back: here,
    });
    const price = ids.length
      ? {
          value: formatStartingPrice(totalPrice(stylist, ids)),
          detail: `about ${formatDuration(visitLength(env.catalog, ids))}`,
        }
      : lowest === null
        ? null
        : { value: formatStartingPrice(lowest) };
    return (
      <StylistCard
        key={stylist.id}
        to={profile}
        {...stylistCardIdentity(stylist)}
        distance={myLocation ? formatDistance(milesBetween(myLocation, stylist.location)) : null}
        price={price}
        photos={workThumbnails(stylist)}
        seeAll={{
          to: profile,
          label: `See all of ${firstName(stylist.name)}’s work, services, and reviews`,
        }}
        slots={{
          heading: slotsHeading,
          items: openingChips(stylist, match.openings, {
            clock: env.clock,
            serviceIds: ids,
            back: here,
          }),
        }}
      />
    );
  }

  const when = [
    filters.day ? formatDay(filters.day) : null,
    filters.timeOfDay ? `in the ${TIMES_OF_DAY[filters.timeOfDay].label.toLowerCase()}` : null,
  ]
    .filter(Boolean)
    .join(' ');
  const names = filters.serviceIds.map((id) => env.catalog[id].name);
  const count = outcome.matches.length;
  const countText = !outcome.offering.length
    ? 'No stylists yet'
    : !count && timed
      ? 'No exact matches'
      : `${count} ${count === 1 ? 'stylist' : 'stylists'}${activeCount ? ' can fit you in' : ''}`;

  const summary = [
    names.length ? names.join(' + ') : 'Any service',
    filters.day ? formatDay(filters.day) : 'Any day',
    filters.timeOfDay ? TIMES_OF_DAY[filters.timeOfDay].label : 'Any time',
  ].join(' · ');

  // Where she is in the guide: picking services, then the optional when, then tapping a time.
  const guideStep = showingResults ? 2 : filters.serviceIds.length ? 1 : 0;

  return (
    <Narrow>
      <PageIntro title="Book">
        Pick what you want done and when. We&rsquo;ll show who can fit you in.
      </PageIntro>
      <StepGuide label="How booking works" steps={GUIDE} current={guideStep} />

      {showingResults ? (
        <section className={styles.results} aria-label="Stylists who can fit you in">
          <div className={styles.summary}>
            <p>
              <span className="visually-hidden">Your search: </span>
              {summary}
            </p>
            <Link
              to={{ pathname: location.pathname, search: searchFor(filters) }}
              className={styles.edit}
              aria-label="Edit your search"
            >
              Edit
            </Link>
          </div>

          <Section title="Tap a time to book">
            <p className={styles.count} aria-live="polite">
              {countText}
            </p>

            {!outcome.offering.length ? (
              <EmptyNote>
                Nobody offers {names.join(' + ')} together yet. Try removing one service.
              </EmptyNote>
            ) : count ? (
              <div className={styles.list}>{outcome.matches.map((m) => card(m, 'Next open'))}</div>
            ) : timed ? (
              <>
                <Notice title={`No openings ${when}`}>
                  Nobody has a long enough opening then. Here are the soonest times these stylists
                  do have.
                </Notice>
                <p className={styles.alternatives}>Other times</p>
                <div className={styles.list}>
                  {outcome.alternatives.map((m) => card(m, 'Other open times'))}
                </div>
              </>
            ) : (
              <EmptyNote>No openings in the next three weeks. Check back soon.</EmptyNote>
            )}
          </Section>
        </section>
      ) : (
        <div className={styles.filters}>
          <Section title="What do you need?">
            <p className={styles.hint}>Pick as many as you like.</p>
            <ChipRow label="Services" wrap>
              {SERVICE_IDS.map((id) => (
                <Chip
                  key={id}
                  selected={filters.serviceIds.includes(id)}
                  onClick={() => toggleService(id)}
                >
                  {env.catalog[id].name}
                </Chip>
              ))}
            </ChipRow>
            {filters.serviceIds.length ? (
              <p className={styles.estimate}>
                {filters.serviceIds.length > 1 ? 'Together these take about ' : 'Takes about '}
                {formatDuration(visitLength(env.catalog, filters.serviceIds))}.
              </p>
            ) : null}
          </Section>

          <Section title="Which day?" optional>
            <SlotPicker.Days
              days={dayOptions}
              selectedId={filters.day ?? null}
              onSelect={(id) =>
                update({ ...filters, day: filters.day === id ? undefined : (id as IsoDate) })
              }
            />
          </Section>

          <Section title="What time?" optional>
            <ChipRow label="Time of day" wrap>
              <Chip
                selected={filters.timeOfDay === undefined}
                onClick={() => update({ ...filters, timeOfDay: undefined })}
              >
                Any time
              </Chip>
              {TIME_OF_DAY_IDS.map((id) => (
                <Chip
                  key={id}
                  selected={filters.timeOfDay === id}
                  onClick={() =>
                    update({ ...filters, timeOfDay: filters.timeOfDay === id ? undefined : id })
                  }
                >
                  {TIMES_OF_DAY[id].label}
                </Chip>
              ))}
            </ChipRow>
          </Section>
          <div className={styles.next}>
            <p className={styles.count} aria-live="polite">
              {countText}
            </p>
            <Button onClick={showResults} fullWidth>
              See who can fit me in
            </Button>
            {activeCount ? (
              <TextButton
                onClick={() => update({ serviceIds: [], day: undefined, timeOfDay: undefined })}
              >
                Clear filters ({activeCount})
              </TextButton>
            ) : null}
          </div>
        </div>
      )}
    </Narrow>
  );
}
