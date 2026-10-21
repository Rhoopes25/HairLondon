import { useLocation, useNavigate, useSearchParams } from 'react-router';
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
import { isTimed, searchableDays, searchStylists, visitLength } from '@src/domain/stylists/book-search';
import type { StylistMatch } from '@src/domain/stylists/book-search';
import { serviceIdsParam } from '@src/domain/stylists/filter';
import { openingChips } from '@app/features/scheduling';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { profilePath, queryString, readServiceIds } from '@app/lib/links';
import { stylistCardIdentity, workThumbnails } from '@app/lib/stylist-card';
import { useSearchEnvironment, useStylists } from '@app/services';
import {
  Chip,
  ChipRow,
  EmptyNote,
  Notice,
  PageIntro,
  Section,
  SlotPicker,
  StylistCard,
  TextButton,
} from '@app/ui';
import type { DayOption } from '@app/ui';
import styles from './BookPage.module.css';

interface Filters {
  serviceIds: ServiceId[];
  day: IsoDate | undefined;
  timeOfDay: TimeOfDay | undefined;
}

/**
 * Book: say what you need, optionally when, and see who can fit you in. The filters live in the
 * URL, so a refresh, the back button, and "Back to your search" from a profile all return here
 * exactly as she left it. Each result's open times start a booking with that time held.
 */
export function BookPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stylists = useStylists();
  const env = useSearchEnvironment();
  useDocumentTitle('Book');

  const days = searchableDays(env.clock, stylists);
  const requestedDay = searchParams.get('day');
  const requestedTime = searchParams.get('time');
  const filters: Filters = {
    serviceIds: readServiceIds(searchParams),
    // A day outside the strip (an old or typed link) is simply ignored.
    day: isIsoDate(requestedDay) && days.includes(requestedDay) ? requestedDay : undefined,
    timeOfDay: isTimeOfDay(requestedTime) ? requestedTime : undefined,
  };

  function update(next: Filters) {
    // Replace, not push: every tap on a filter would otherwise be a step the back button must undo.
    const search = queryString({
      services: next.serviceIds.length ? serviceIdsParam(next.serviceIds) : undefined,
      day: next.day,
      time: next.timeOfDay,
    });
    navigate({ pathname: location.pathname, search }, { replace: true });
  }

  function toggleService(id: ServiceId) {
    const picked = new Set(filters.serviceIds);
    if (!picked.delete(id)) picked.add(id);
    // Keep the catalog's order so the same picks always make the same link.
    update({ ...filters, serviceIds: SERVICE_IDS.filter((existing) => picked.has(existing)) });
  }

  const outcome = searchStylists(stylists, filters, env);
  const timed = isTimed(filters);
  const activeCount = filters.serviceIds.length + (filters.day ? 1 : 0) + (filters.timeOfDay ? 1 : 0);
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

  return (
    <>
      <PageIntro title="Book">
        Pick what you want done and when. We&rsquo;ll show who can fit you in.
      </PageIntro>

      <div className={styles.layout}>
        <div className={styles.filters}>
          <Section title="What do you need?" step={1}>
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
              any={{
                selected: filters.day === undefined,
                onSelect: () => update({ ...filters, day: undefined }),
              }}
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

          {activeCount ? (
            <div className={styles.clear}>
              <TextButton
                onClick={() => update({ serviceIds: [], day: undefined, timeOfDay: undefined })}
              >
                Clear filters ({activeCount})
              </TextButton>
            </div>
          ) : null}
        </div>

        <section className={styles.results} aria-label="Stylists who can fit you in">
          <Section title="Tap a time to book" step={2}>
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
      </div>
    </>
  );
}
