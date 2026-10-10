import { useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { AddToCalendar, servicesText, totalText, whenText } from '@app/features/appointments';
import { useDocumentTitle, useFocusOnMount } from '@app/hooks/usePageBehavior';
import { useAppointment, useServices } from '@app/services';
import { HeaderBar, Icon, LinkButton, Narrow, QuietLink, Recap } from '@app/ui';
import { useBooking } from './BookingProvider';
import styles from './DoneStep.module.css';

/** Step 4: it is booked. Reads the appointment back from storage, so a refresh still shows it. */
export function DoneStep() {
  const [searchParams] = useSearchParams();
  const appointment = useAppointment(searchParams.get('appointment'));
  const { stylist, reset } = useBooking();
  const { catalog } = useServices();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  useDocumentTitle('You’re booked');

  // It is booked, so the draft is finished. Clearing it means Back cannot book the same visit twice.
  useEffect(() => {
    reset();
  }, [reset]);

  if (!appointment) return <Navigate to="/appointments" replace />;

  return (
    <>
      <HeaderBar>
        <span className={styles.spacer} aria-hidden="true" />
        <span className={styles.title}>Booked with {stylist.name}</span>
        <span className={styles.spacer} aria-hidden="true" />
      </HeaderBar>

      <Narrow>
        <section className={styles.done}>
          <div className={styles.mark} aria-hidden="true">
            <Icon name="check" strokeWidth={2} />
          </div>
          <h1 ref={headingRef} tabIndex={-1}>
            You&rsquo;re booked
          </h1>
          <p>A reminder text will go to {appointment.phone} the day before.</p>
        </section>

        <Recap
          rows={[
            { label: 'Stylist', value: `${stylist.name}, ${stylist.studio}` },
            { label: 'Services', value: servicesText(appointment, catalog) },
            { label: 'When', value: whenText(appointment) },
            { label: 'Total', value: totalText(appointment) },
            { label: 'Name', value: appointment.name },
          ]}
        />

        <div className={styles.actions}>
          <AddToCalendar appointment={appointment} />
          <LinkButton to={`/appointments/${appointment.id}`} fullWidth>
            View my appointment
          </LinkButton>
          <p className={styles.links}>
            <QuietLink to="/">Back to home</QuietLink>
            <Link to="/stylists" className={styles.more}>
              Browse more stylists
            </Link>
          </p>
        </div>
      </Narrow>
    </>
  );
}
