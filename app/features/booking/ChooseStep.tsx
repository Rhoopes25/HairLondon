import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  bookingProgress,
  isComplete,
  summaryLine,
  timeNote,
  totalLine,
} from '@src/domain/booking/draft';
import { formatDuration } from '@src/domain/format/duration';
import { firstName } from '@src/domain/format/name';
import { formatStartingPrice } from '@src/domain/format/price';
import { SERVICE_IDS } from '@src/domain/models/service';
import { totalDuration, totalPrice } from '@src/domain/pricing/totals';
import { SlotSelector } from '@app/features/scheduling';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { cx } from '@app/lib/cx';
import { useServices } from '@app/services';
import {
  Button,
  ConfirmBar,
  Container,
  PageIntro,
  Section,
  ServiceOption,
  ServiceSummary,
  SplitLayout,
} from '@app/ui';
import { BookingHeader } from './BookingHeader';
import { useBooking } from './BookingProvider';
import styles from './ChooseStep.module.css';

/** Step 1: services, day, time. Everything on one screen so the choices stay in view together. */
export function ChooseStep() {
  const {
    stylist,
    draft,
    droppedStart,
    arrivedWithServices,
    toggleService,
    selectDate,
    selectStart,
  } = useBooking();
  const { catalog } = useServices();
  const navigate = useNavigate();
  const listId = useId();
  const [changing, setChanging] = useState(false);
  useDocumentTitle(`Book with ${stylist.name}`);

  const started = draft.serviceIds.length > 0 || draft.date !== null;
  const picked = draft.serviceIds.length > 0;
  // She arrived with services chosen: show them as one line, and the list only if she asks.
  // With nothing chosen there is nothing to summarize, so the list stays open.
  const showList = !arrivedWithServices || changing || !picked;
  const summarized = arrivedWithServices && picked;

  return (
    <>
      <BookingHeader confirmExit={started} />
      <Container>
        <PageIntro title="Book Now" />

        <SplitLayout
          aside={
            <ConfirmBar
              sticky
              progress={bookingProgress(draft)}
              summary={summaryLine(draft, catalog)}
              total={{ label: 'Estimated total', value: totalLine(draft, stylist, catalog) }}
              note={
                picked
                  ? `Starting price. Longer or thicker hair can cost more, and ${firstName(stylist.name)} will confirm it with you.`
                  : undefined
              }
            >
              <Button
                fullWidth
                disabled={!isComplete(draft)}
                onClick={() => navigate(`/book/${stylist.id}/details`)}
              >
                Continue
              </Button>
            </ConfirmBar>
          }
        >
          <Section title={arrivedWithServices ? 'Your services' : 'Choose your services'}>
            {summarized ? (
              <ServiceSummary
                names={draft.serviceIds.map((id) => catalog[id].name).join(' + ')}
                meta={`${formatStartingPrice(totalPrice(stylist, draft.serviceIds))} · about ${formatDuration(totalDuration(catalog, draft.serviceIds))}`}
                expanded={showList}
                onToggle={() => setChanging(!changing)}
                controls={listId}
              />
            ) : null}
            <div
              id={listId}
              className={cx(styles.services, summarized && styles.afterSummary)}
              hidden={!showList}
            >
              {SERVICE_IDS.filter((id) => stylist.prices[id] !== undefined).map((id) => {
                const service = catalog[id];
                return (
                  <ServiceOption
                    key={id}
                    name={service.name}
                    description={service.description}
                    meta={`${formatDuration(service.durationMin)} · ${formatStartingPrice(stylist.prices[id] ?? 0)}`}
                    checked={draft.serviceIds.includes(id)}
                    onChange={() => toggleService(id)}
                  />
                );
              })}
            </div>
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
        </SplitLayout>
      </Container>
    </>
  );
}
