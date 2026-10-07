import { useNavigate } from 'react-router';
import { doneByNote, isComplete, summaryLine, totalLine } from '@src/domain/booking/draft';
import { formatDuration } from '@src/domain/format/duration';
import { SERVICE_IDS } from '@src/domain/models/service';
import { SlotSelector } from '@app/features/scheduling';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useServices } from '@app/services';
import { Button, ConfirmBar, PageIntro, Section, ServiceOption } from '@app/ui';
import { BookingHeader } from './BookingHeader';
import { useBooking } from './BookingProvider';
import styles from './ChooseStep.module.css';

/** Step 1: services, day, time. Everything on one screen so the choices stay in view together. */
export function ChooseStep() {
  const { stylist, draft, toggleService, selectDate, selectStart } = useBooking();
  const { catalog } = useServices();
  const navigate = useNavigate();
  useDocumentTitle(`Book with ${stylist.name}`);

  const started = draft.serviceIds.length > 0 || draft.date !== null;

  return (
    <>
      <BookingHeader confirmExit={started} />
      <PageIntro title="Book Now" />

      <Section title="Choose your services">
        <div className={styles.services}>
          {SERVICE_IDS.filter((id) => stylist.prices[id] !== undefined).map((id) => {
            const service = catalog[id];
            return (
              <ServiceOption
                key={id}
                name={service.name}
                description={service.description}
                meta={`${formatDuration(service.durationMin)} · $${stylist.prices[id]}`}
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
        note={doneByNote(draft, catalog)}
      />

      <ConfirmBar
        summary={summaryLine(draft, catalog)}
        total={{ value: totalLine(draft, stylist, catalog) }}
      >
        <Button
          fullWidth
          disabled={!isComplete(draft)}
          onClick={() => navigate(`/book/${stylist.id}/details`)}
        >
          Continue
        </Button>
      </ConfirmBar>
    </>
  );
}
