import { useMemo } from 'react';
import { groupAppointments } from '@src/domain/booking/appointments';
import type { Appointment, AppointmentPhase } from '@src/domain/models/appointment';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useAppointments, useServices } from '@app/services';
import { EmptyNote, LinkButton, PageIntro, Section } from '@app/ui';
import { AppointmentCard } from './AppointmentCard';
import styles from './AppointmentsPage.module.css';

function List({
  appointments,
  phase,
}: {
  appointments: readonly Appointment[];
  phase: AppointmentPhase;
}) {
  return (
    <div className={styles.list}>
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} phase={phase} />
      ))}
    </div>
  );
}

export function AppointmentsPage() {
  useDocumentTitle('My appointments');
  const { clock } = useServices();
  const appointments = useAppointments();
  const grouped = useMemo(() => groupAppointments(appointments, clock), [appointments, clock]);

  return (
    <>
      <PageIntro title="My appointments">Your upcoming and past visits.</PageIntro>

      <Section title="Upcoming">
        {grouped.upcoming.length ? (
          <List appointments={grouped.upcoming} phase="upcoming" />
        ) : (
          <>
            <EmptyNote>You don&rsquo;t have anything booked yet.</EmptyNote>
            <div className={styles.cta}>
              <LinkButton to="/stylists">Find a stylist</LinkButton>
            </div>
          </>
        )}
      </Section>

      {grouped.past.length ? (
        <Section title="Past visits">
          <List appointments={grouped.past} phase="past" />
        </Section>
      ) : null}

      {grouped.cancelled.length ? (
        <Section title="Cancelled">
          <List appointments={grouped.cancelled} phase="cancelled" />
        </Section>
      ) : null}
    </>
  );
}
