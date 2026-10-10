import { useNotice } from './NoticeProvider';
import styles from './PrototypeNotice.module.css';

/** A slim label at the top of every screen, so the early-stage message is never a one-time event. */
export function PrototypeStrip() {
  const { open } = useNotice();
  return (
    <aside className={styles.strip} aria-label="Early prototype">
      <strong>Early prototype</strong>
      <span aria-hidden="true">&middot;</span>
      <button type="button" className={styles.stripButton} onClick={open}>
        What&rsquo;s this?
      </button>
    </aside>
  );
}
