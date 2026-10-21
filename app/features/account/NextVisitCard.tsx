import { Link } from 'react-router';
import { nextVisit } from '@src/domain/account/account';
import type { Account } from '@src/domain/account/account';
import { formatDay } from '@src/domain/format/date';
import { formatTime } from '@src/domain/format/time';
import { assetUrl, photoSrcSet } from '@app/config';
import { useAppointments, useServices, useStylist } from '@app/services';
import { Avatar, QuietLink } from '@app/ui';
import styles from './NextVisitCard.module.css';

/**
 * Her next visit, for when she is signed in: the one thing worth knowing before booking another.
 * With nothing coming up it says so in one quiet line and points at her past visits, where
 * "Book again" lives.
 */
export function NextVisitCard({ account }: { account: Account }) {
  const { catalog, clock } = useServices();
  const appointments = useAppointments();
  const visit = nextVisit(account, appointments, clock);
  const stylist = useStylist(visit?.stylistId);

  if (!visit) {
    return (
      <p className={styles.none}>
        Nothing booked yet. <QuietLink to="/appointments">See past visits</QuietLink>
      </p>
    );
  }

  const services = visit.serviceIds.map((id) => catalog[id].name).join(' + ');
  const name = stylist?.name ?? 'your stylist';
  return (
    <section className={styles.card} aria-label="Your next visit">
      <span className={styles.label}>Your next visit</span>
      <div className={styles.row}>
        <Avatar
          name={name}
          photoUrl={stylist?.photo ? assetUrl(stylist.photo) : null}
          photoSrcSet={stylist?.photo ? photoSrcSet(stylist.photo) : undefined}
          size="sm"
        />
        <Link to={`/appointments/${visit.id}`} className={styles.link}>
          <span className={styles.what}>
            {services} with {name}
          </span>
          <span className={styles.when}>
            {formatDay(visit.date)} at {formatTime(visit.start)}
          </span>
        </Link>
      </div>
      <QuietLink to="/appointments">All my appointments</QuietLink>
    </section>
  );
}
