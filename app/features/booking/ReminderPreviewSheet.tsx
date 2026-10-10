import { formatDay } from '@src/domain/format/date';
import { firstName } from '@src/domain/format/name';
import { formatTime } from '@src/domain/format/time';
import type { CompleteDraft } from '@src/domain/booking/draft';
import type { Stylist } from '@src/domain/models/stylist';
import { Button, Sheet } from '@app/ui';
import styles from './ReminderPreviewSheet.module.css';

/** Shows what the day-before reminder text will say. No text is ever sent from this prototype. */
export function ReminderPreviewSheet({
  open,
  onClose,
  draft,
  stylist,
  clientName,
}: {
  open: boolean;
  onClose: () => void;
  draft: CompleteDraft;
  stylist: Stylist;
  clientName: string;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Your reminder text"
      footer={
        <Button fullWidth onClick={onClose}>
          Got it
        </Button>
      }
    >
      <p>The day before, you&rsquo;ll get a text like this:</p>
      <p className={styles.bubble}>
        Hi {clientName.trim() ? firstName(clientName) : 'there'}, a reminder that you&rsquo;re
        booked with {firstName(stylist.name)} at {stylist.studio} tomorrow ({formatDay(draft.date)})
        at {formatTime(draft.start)}. See you then.
      </p>
      <p>This is a sample. No texts are sent from this prototype.</p>
    </Sheet>
  );
}
