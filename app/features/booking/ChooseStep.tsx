import { useNavigate } from 'react-router';
import { isComplete, summaryLine, timeNote } from '@src/domain/booking/draft';
import { formatDuration } from '@src/domain/format/duration';
import { firstName } from '@src/domain/format/name';
import { formatStartingPrice } from '@src/domain/format/price';
import { SERVICE_IDS } from '@src/domain/models/service';
import { isLongVisit, totalDuration, totalPrice } from '@src/domain/pricing/totals';
import { SlotSelector } from '@app/features/scheduling';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useServices } from '@app/services';
import {
  Button,
  Chip,
  ChipRow,
  Container,
  LongVisitNotice,
  Narrow,
  PageIntro,
  RunningTotal,
  Section,
} from '@app/ui';
import { BookingHeader } from './BookingHeader';
import { useBooking } from './BookingProvider';
import styles from './ChooseStep.module.css';

/** Step 1: services, day, time, laid out like the Book page so both ways in feel the same. */
export function ChooseStep() {
  const { stylist, draft, droppedStart, toggleService, selectDate, selectStart } = useBooking();
  const { catalog } = useServices();
  const navigate = useNavigate();
  useDocumentTitle(`Book with ${stylist.name}`);

  const started = draft.serviceIds.length > 0 || draft.date !== null;
  const picked = draft.serviceIds.length > 0;
  const offered = SERVICE_IDS.filter((id) => stylist.prices[id] !== undefined);
  const minutes = totalDuration(catalog, draft.serviceIds);

  // Same shape as the Book page: one centered column, chips for services, the day strip, then
  // the one action under it all. Only the times differ: here she picks an exact time.
  return (
    <>
      <BookingHeader confirmExit={started} step={0} />
      <Container>
        <Narrow>
          <PageIntro title="Book Now" />

          <Section title="What do you need?" large>
            <p className={styles.hint}>Pick as many as you like.</p>
            <ChipRow label="Services" wrap>
              {offered.map((id) => (
                <Chip
                  key={id}
                  selected={draft.serviceIds.includes(id)}
                  onClick={() => toggleService(id)}
                >
                  {catalog[id].name} {formatStartingPrice(stylist.prices[id] ?? 0)}
                </Chip>
              ))}
            </ChipRow>
            {picked ? (
              <p className={styles.estimate}>
                {draft.serviceIds.length > 1 ? 'Together these take about ' : 'Takes about '}
                {formatDuration(minutes)}.
              </p>
            ) : null}
            {picked && isLongVisit(minutes) ? (
              <div className={styles.notice}>
                <LongVisitNotice duration={formatDuration(minutes)} />
              </div>
            ) : null}
          </Section>

          <SlotSelector
            stylist={stylist}
            serviceIds={draft.serviceIds}
            date={draft.date}
            start={draft.start}
            onSelectDate={selectDate}
            onSelectStart={selectStart}
            note={timeNote(draft, catalog, droppedStart)}
          />

          {picked ? (
            <RunningTotal
              price={formatStartingPrice(totalPrice(stylist, draft.serviceIds))}
              duration={`about ${formatDuration(minutes)}`}
              note={`Starting price. Longer or thicker hair can cost more, and ${firstName(stylist.name)} will confirm it with you.`}
            />
          ) : null}

          <div className={styles.next}>
            <p className={styles.summary} aria-live="polite">
              {summaryLine(draft, catalog)}
            </p>
            <Button
              fullWidth
              disabled={!isComplete(draft)}
              onClick={() => navigate(`/book/${stylist.id}/details`)}
            >
              Continue
            </Button>
          </div>
        </Narrow>
      </Container>
    </>
  );
}
