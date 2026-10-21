import { Link } from 'react-router';
import type { Appointment, AppointmentPhase } from '@src/domain/models/appointment';
import { assetUrl, photoSrcSet } from '@app/config';
import { bookingPath } from '@app/lib/links';
import { useServices, useStylist } from '@app/services';
import { Avatar, Icon, LinkButton } from '@app/ui';
import { servicesText, whenText } from './appointment-view';
import styles from './AppointmentCard.module.css';

const PHASE_LABEL: Record<AppointmentPhase, string> = {
  upcoming: 'Upcoming',
  past: 'Completed',
  cancelled: 'Cancelled',
};

/**
 * One visit in the list: who, what, when. Its link stretches over the card, so a tap
 * anywhere opens the visit. A past visit also offers "Book again" right here, with the same
 * stylist and services chosen, because rebooking is the most common reason to look back.
 */
export function AppointmentCard({
  appointment,
  phase,
}: {
  appointment: Appointment;
  phase: AppointmentPhase;
}) {
  const { catalog } = useServices();
  const stylist = useStylist(appointment.stylistId);
  const name = stylist?.name ?? 'Stylist';
  const what = `${servicesText(appointment, catalog)} with ${name}`;

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <Avatar
          name={name}
          photoUrl={stylist?.photo ? assetUrl(stylist.photo) : null}
          photoSrcSet={stylist?.photo ? photoSrcSet(stylist.photo) : undefined}
        />
        <Link to={`/appointments/${appointment.id}`} className={styles.body}>
          <span className={styles.who}>{what}</span>
          <span className={styles.when}>{whenText(appointment)}</span>
          <span className={styles.status} data-phase={phase}>
            {PHASE_LABEL[phase]}
          </span>
        </Link>
        <Icon name="chevron-right" className={styles.arrow} />
      </div>

      {phase === 'past' && stylist ? (
        <LinkButton
          className={styles.again}
          to={bookingPath({
            stylistId: appointment.stylistId,
            serviceIds: appointment.serviceIds,
            back: '/appointments',
          })}
          aria-label={`Book again: ${what}`}
          fullWidth
        >
          Book again
        </LinkButton>
      ) : null}
    </article>
  );
}
