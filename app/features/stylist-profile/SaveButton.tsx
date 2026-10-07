import { firstName } from '@src/domain/format/name';
import type { Stylist } from '@src/domain/models/stylist';
import { useSavedIds, useServices } from '@app/services';
import { Icon } from '@app/ui';
import styles from './SaveButton.module.css';

/** Save a stylist to come back to. A toggle: its state is announced, not just drawn. */
export function SaveButton({ stylist }: { stylist: Stylist }) {
  const { saved } = useServices();
  const isSaved = useSavedIds().includes(stylist.id);

  return (
    <button
      type="button"
      className={styles.save}
      aria-pressed={isSaved}
      aria-label={`Save ${firstName(stylist.name)}`}
      onClick={() => saved.toggle(stylist.id)}
    >
      <Icon name="heart" filled={isSaved} />
      <span>{isSaved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
