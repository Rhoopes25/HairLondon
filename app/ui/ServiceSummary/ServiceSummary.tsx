import { TextButton } from '../Button';
import styles from './ServiceSummary.module.css';

export interface ServiceSummaryProps {
  /** "Haircut + Color" */
  names: string;
  /** "$185+ · about 3 hr" */
  meta: string;
  /** Whether the full list of services is showing under this line. */
  expanded: boolean;
  onToggle: () => void;
  /** The id of the list this line opens and closes. */
  controls: string;
}

/**
 * Services she already picked, as one line instead of the whole list again, with a way to change
 * them. It keeps the booking page short when she arrives from a search that chose services.
 */
export function ServiceSummary({ names, meta, expanded, onToggle, controls }: ServiceSummaryProps) {
  return (
    <div className={styles.summary}>
      <div className={styles.text}>
        <span className={styles.names}>{names}</span>
        <span className={styles.meta}>{meta}</span>
      </div>
      <TextButton
        className={styles.toggle}
        aria-expanded={expanded}
        aria-controls={controls}
        onClick={onToggle}
      >
        {expanded ? 'Done' : 'Change'}
      </TextButton>
    </div>
  );
}
