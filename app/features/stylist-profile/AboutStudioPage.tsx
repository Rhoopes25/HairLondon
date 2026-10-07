import { Navigate, useParams } from 'react-router';
import { firstName } from '@src/domain/format/name';
import { formatTime } from '@src/domain/format/time';
import { describeWorkDays } from '@src/domain/stylists/filter';
import { SALON_HOURS } from '@src/domain/scheduling/salon-hours';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useStylist } from '@app/services';
import { BackLink, Icon, LinkButton, PageIntro, QuietLink } from '@app/ui';
import styles from './AboutStudioPage.module.css';

/** Where and when: the practical facts someone checks before committing to a stylist. */
export function AboutStudioPage() {
  const { id } = useParams();
  const stylist = useStylist(id);
  useDocumentTitle(stylist ? stylist.studio : 'Studio');

  if (!stylist) return <Navigate to="/stylists" replace />;

  return (
    <>
      <BackLink to={`/stylists/${stylist.id}`}>Back to {firstName(stylist.name)}</BackLink>
      <PageIntro title={stylist.studio}>{stylist.bio}</PageIntro>

      <ul className={styles.facts}>
        <li>
          <Icon name="map-pin" />
          <span>
            <strong>Where</strong>
            {stylist.city}
          </span>
        </li>
        <li>
          <Icon name="calendar" />
          <span>
            <strong>Days</strong>
            {describeWorkDays(stylist.workDays)}
          </span>
        </li>
        <li>
          <Icon name="clock" />
          <span>
            <strong>Hours</strong>
            {formatTime(SALON_HOURS.open)} to {formatTime(SALON_HOURS.close)}
          </span>
        </li>
      </ul>

      <div className={styles.cta}>
        <LinkButton to={`/book/${stylist.id}`} fullWidth>
          Book with {firstName(stylist.name)}
        </LinkButton>
        <QuietLink to={`/stylists/${stylist.id}/services`}>See services and prices</QuietLink>
      </div>
    </>
  );
}
