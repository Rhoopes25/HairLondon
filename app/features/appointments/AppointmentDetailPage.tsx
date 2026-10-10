import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useServices } from '@app/services';
import {
  BackLink,
  ConfirmBar,
  ConfirmDialog,
  EmptyNote,
  LinkButton,
  Narrow,
  PageIntro,
  Recap,
  TextButton,
} from '@app/ui';
import { AddToCalendar } from './AddToCalendar';
import { servicesText, totalText, whenText } from './appointment-view';
import { useAppointmentPage } from './useAppointmentPage';
import styles from './AppointmentDetailPage.module.css';

const HEADINGS = {
  upcoming: 'Your appointment',
  past: 'Past visit',
  cancelled: 'Cancelled',
} as const;

export function AppointmentDetailPage() {
  const { appointment, stylist, phase, reviewed } = useAppointmentPage();
  const { appointments, catalog } = useServices();
  const navigate = useNavigate();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  useDocumentTitle('Appointment');

  if (!appointment || !phase) {
    return (
      <>
        <BackLink to="/appointments">My appointments</BackLink>
        <PageIntro title="We couldn’t find that appointment" />
        <EmptyNote>It may have been removed. Your other visits are in My appointments.</EmptyNote>
      </>
    );
  }

  const name = stylist?.name ?? 'your stylist';
  const bookAgain = `/book/${appointment.stylistId}?service=${appointment.serviceIds[0] ?? ''}`;

  return (
    <Narrow>
      <BackLink to="/appointments">My appointments</BackLink>
      <PageIntro title={HEADINGS[phase]} />
      <Recap
        rows={[
          {
            label: 'Stylist',
            value: stylist ? <Link to={`/stylists/${stylist.id}`}>{stylist.name}</Link> : name,
          },
          { label: 'Services', value: servicesText(appointment, catalog) },
          { label: 'When', value: whenText(appointment) },
          { label: 'Total', value: totalText(appointment) },
          { label: 'Name', value: appointment.name },
          { label: 'Phone', value: appointment.phone },
        ]}
      />

      <ConfirmBar>
        {phase === 'upcoming' ? (
          <div className={styles.actions}>
            <AddToCalendar appointment={appointment} />
            <LinkButton
              to={`/appointments/${appointment.id}/reschedule`}
              variant="outline"
              fullWidth
            >
              Reschedule
            </LinkButton>
            <TextButton onClick={() => setConfirmingCancel(true)}>Cancel appointment</TextButton>
          </div>
        ) : null}

        {phase === 'past' ? (
          <div className={styles.actions}>
            {reviewed ? (
              <p className={styles.note}>Thanks for reviewing {name}.</p>
            ) : (
              <LinkButton to={`/appointments/${appointment.id}/review`} fullWidth>
                Leave a review
              </LinkButton>
            )}
            <LinkButton to={bookAgain} variant="outline" fullWidth>
              Book again
            </LinkButton>
          </div>
        ) : null}

        {phase === 'cancelled' ? (
          <div className={styles.actions}>
            <p className={styles.note}>
              This appointment was cancelled, and the time is open again.
            </p>
            <LinkButton to={bookAgain} fullWidth>
              Book a new time
            </LinkButton>
          </div>
        ) : null}
      </ConfirmBar>

      <ConfirmDialog
        open={confirmingCancel}
        title="Cancel this appointment?"
        message={`Your ${servicesText(appointment, catalog).toLowerCase()} with ${name} on ${whenText(appointment)} will be cancelled and the time will open up for others.`}
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep my appointment"
        onCancel={() => setConfirmingCancel(false)}
        onConfirm={() => {
          appointments.cancel(appointment.id);
          setConfirmingCancel(false);
          navigate('/appointments');
        }}
      />
    </Narrow>
  );
}
