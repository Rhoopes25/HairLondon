import { firstName } from '@src/domain/format/name';
import { formatTime } from '@src/domain/format/time';
import type { Stylist } from '@src/domain/models/stylist';
import { SALON_HOURS } from '@src/domain/scheduling/salon-hours';
import { describeWorkDays } from '@src/domain/stylists/filter';
import { directionsUrl } from '@src/domain/stylists/location';
import { Icon, MapCard } from '@app/ui';
import styles from './AboutMePanel.module.css';

/**
 * "Get to know me": the person behind the photos, in her own words, plus where her chair is.
 * Trust is the reason she is here, and knowing who she is sitting down with is part of it.
 */
export function AboutMePanel({
  stylist,
  distance,
}: {
  stylist: Stylist;
  distance?: string | null;
}) {
  const first = firstName(stylist.name);
  return (
    <div className={styles.panel}>
      <h2 className={styles.hello}>Hi, I&rsquo;m {first}</h2>
      <p className={styles.story}>{stylist.story}</p>

      <ul className={styles.facts}>
        <li>
          <Icon name="clock" />
          <span>
            {stylist.yearsDoingHair} {stylist.yearsDoingHair === 1 ? 'year' : 'years'} doing hair
          </span>
        </li>
        <li>
          <Icon name="sparkle" />
          <span>Loves doing {stylist.specialties.join(', ').toLowerCase()}</span>
        </li>
        <li>
          <Icon name="calendar" />
          <span>
            {describeWorkDays(stylist.workDays)}, {formatTime(SALON_HOURS.open)} to{' '}
            {formatTime(SALON_HOURS.close)}
          </span>
        </li>
      </ul>

      <h3 className={styles.where}>Where to find me</h3>
      <MapCard
        address={stylist.location.address}
        directionsUrl={directionsUrl(stylist.location)}
        distance={distance}
      />
      <p className={styles.sample}>Sample address for this prototype.</p>
    </div>
  );
}
