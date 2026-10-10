import { Link } from 'react-router';
import { Icon } from '../Icon';
import styles from './ServiceRow.module.css';

export interface ServiceRowProps {
  /** Where tapping the row goes (usually booking with this service chosen). */
  to: string;
  name: string;
  description: string;
  /** e.g. "1 hr · $65" */
  meta: string;
  /** Adds a separate "details" button beside the link. */
  onInfo?: () => void;
}

/** A service with its price. The whole row is the link; the optional info button is separate. */
export function ServiceRow({ to, name, description, meta, onInfo }: ServiceRowProps) {
  return (
    <div className={styles.row}>
      <Link to={to} className={styles.link}>
        <span className={styles.body}>
          <span className={styles.name}>{name}</span>
          <span className={styles.desc}>{description}</span>
        </span>
        <span className={styles.meta}>{meta}</span>
        <Icon name="chevron-right" className={styles.arrow} />
      </Link>
      {onInfo ? (
        <button
          type="button"
          className={styles.info}
          onClick={onInfo}
          aria-label={`More about ${name}`}
        >
          <Icon name="info" />
        </button>
      ) : null}
    </div>
  );
}
