import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { addDuration } from '@src/domain/models/time';
import type { IsoDate, MinuteOfDay } from '@src/domain/models/time';
import { formatDay } from '@src/domain/format/date';
import { formatRange } from '@src/domain/format/time';
import { SlotSelector } from '@app/features/scheduling';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useServices } from '@app/services';
import { BackLink, Button, ConfirmBar, EmptyNote, PageIntro } from '@app/ui';
import { servicesText, whenText } from './appointment-view';
import { useAppointmentPage } from './useAppointmentPage';

/** Move an upcoming visit to a new time, reusing the same day and time picker as booking. */
export function ReschedulePage() {
  const { appointment, stylist, phase } = useAppointmentPage();
  const { appointments, catalog } = useServices();
  const navigate = useNavigate();
  const [date, setDate] = useState<IsoDate | null>(null);
  const [start, setStart] = useState<MinuteOfDay | null>(null);
  useDocumentTitle('Reschedule');

  if (!appointment || !stylist) {
    return (
      <>
        <BackLink to="/appointments">My appointments</BackLink>
        <EmptyNote>We couldn&rsquo;t find that appointment.</EmptyNote>
      </>
    );
  }
  if (phase !== 'upcoming') return <Navigate to={`/appointments/${appointment.id}`} replace />;

  const chosen = date !== null && start !== null;
  const summary = chosen
    ? `Move to ${formatDay(date)} · ${formatRange(start, addDuration(start, appointment.durationMin))}`
    : 'Choose a new day and time';

  return (
    <>
      <BackLink to={`/appointments/${appointment.id}`}>Back to appointment</BackLink>
      <PageIntro title="Reschedule">
        {servicesText(appointment, catalog)} with {stylist.name}. Now {whenText(appointment)}.
      </PageIntro>

      <SlotSelector
        stylist={stylist}
        serviceIds={appointment.serviceIds}
        date={date}
        start={start}
        ignoreAppointmentId={appointment.id}
        onSelectDate={(next) => {
          setDate(next);
          setStart(null);
        }}
        onSelectStart={setStart}
      />

      <ConfirmBar summary={summary}>
        <Button
          fullWidth
          disabled={!chosen}
          onClick={() => {
            if (!chosen) return;
            appointments.reschedule(appointment.id, date, start);
            navigate(`/appointments/${appointment.id}`);
          }}
        >
          Confirm new time
        </Button>
      </ConfirmBar>
    </>
  );
}
