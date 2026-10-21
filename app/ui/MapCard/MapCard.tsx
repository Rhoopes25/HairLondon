import { Icon } from '../Icon';
import styles from './MapCard.module.css';

export interface MapCardProps {
  /** Street address, shown under the map and used for directions. */
  address: string;
  /** Opens directions in a maps app, in a new tab. */
  directionsUrl: string;
  /** "2.1 mi away", once she has shared where she is. */
  distance?: string | null;
}

/**
 * Where to find her: a simple drawn map with a pin, the address, and a link out for directions.
 * It is a sketch, not a live map, so it loads instantly, never breaks, and stays in the
 * prototype's low-fidelity look. The real map is one tap away in her maps app.
 */
export function MapCard({ address, directionsUrl, distance }: MapCardProps) {
  return (
    <div className={styles.card}>
      <svg
        className={styles.map}
        viewBox="0 0 320 160"
        role="img"
        aria-label={`Map pin at ${address}`}
      >
        <rect className={styles.land} width="320" height="160" />
        <path
          className={styles.water}
          d="M0 118 C70 100 120 140 200 120 S300 98 320 108 V160 H0Z"
        />
        <rect className={styles.park} x="34" y="22" rx="8" width="70" height="42" />
        <g className={styles.roads}>
          <line x1="0" y1="80" x2="320" y2="80" />
          <line x1="140" y1="0" x2="140" y2="160" />
          <line x1="0" y1="30" x2="320" y2="96" />
          <line x1="248" y1="0" x2="248" y2="160" />
        </g>
        <g transform="translate(194 70)">
          <path
            className={styles.pin}
            d="M0 -26 C-11 -26 -18 -18 -18 -9 C-18 4 0 18 0 18 C0 18 18 4 18 -9 C18 -18 11 -26 0 -26Z"
          />
          <circle className={styles.pinDot} cx="0" cy="-9" r="6" />
        </g>
      </svg>
      <div className={styles.body}>
        <p className={styles.address}>
          <Icon name="map-pin" />
          <span>
            {address}
            {distance ? <span className={styles.distance}>{distance}</span> : null}
          </span>
        </p>
        <a className={styles.directions} href={directionsUrl} target="_blank" rel="noreferrer">
          Get directions
          <span className="visually-hidden"> (opens your maps app)</span>
        </a>
      </div>
    </div>
  );
}
