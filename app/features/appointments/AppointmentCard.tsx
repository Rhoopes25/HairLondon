import { Link } from 'react-router';
import type { Appointment, AppointmentPhase } from '@src/domain/models/appointment';
import { useServices, useStylist } from '@app/services';
import { Avatar, Icon } from '@app/ui';
import { assetUrl } from '@app/config';
import { servicesText, whenText } from './appointment-view';
import styles from './AppointmentCard.module.css';

const PHASE_LABEL: Record<AppointmentPhase, string> = {
  upcoming: 'Upcoming',
  past: 'Completed',
  cancelled: 'Cancelled',
};

/** One visit in the list: who, what, when. The whole card opens the visit. */
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

  return (
    <Link to={`/appointments/${appointment.id}`} className={styles.card}>
      <Avatar name={name} photoUrl={stylist?.photo ? assetUrl(stylist.photo) : null} />
      <span className={styles.body}>
        <span className={styles.who}>
          {servicesText(appointment, catalog)} with {name}
        </span>
        <span className={styles.when}>{whenText(appointment)}</span>
        <span className={styles.status} data-phase={phase}>
          {PHASE_LABEL[phase]}
        </span>
      </span>
      <Icon name="chevron-right" className={styles.arrow} />
    </Link>
  );
}
