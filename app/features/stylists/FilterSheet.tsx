import { useState } from 'react';
import { WEEKDAY_NAMES } from '@src/domain/stylists/filter';
import type { Weekday } from '@src/domain/models/time';
import { Button, Sheet, TextButton } from '@app/ui';
import styles from './FilterSheet.module.css';

/**
 * "Which day can you come?" Most clients have a narrow window, so the most useful filter is the
 * day of the week, not a price or a sort order. Choose, see how many stylists match, then show them.
 */
export function FilterSheet({
  open,
  onClose,
  weekday,
  matchCount,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  /** The day currently applied, or undefined for any day. */
  weekday: Weekday | undefined;
  /** How many stylists would match the day picked in the sheet right now. */
  matchCount: (weekday: Weekday | undefined) => number;
  onChange: (weekday: Weekday | undefined) => void;
}) {
  // Stage the choice so the count can update without changing the list behind the sheet.
  const [choice, setChoice] = useState<Weekday | undefined>(weekday);
  const count = matchCount(choice);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Which day can you come?"
      footer={
        <>
          <Button
            fullWidth
            disabled={count === 0}
            onClick={() => {
              onChange(choice);
              onClose();
            }}
          >
            {count === 0
              ? 'No stylists on that day'
              : `Show ${count} ${count === 1 ? 'stylist' : 'stylists'}`}
          </Button>
          <TextButton
            onClick={() => {
              setChoice(undefined);
              onChange(undefined);
              onClose();
            }}
          >
            Clear day filter
          </TextButton>
        </>
      }
    >
      <fieldset className={styles.fieldset}>
        <legend className="visually-hidden">Day of the week</legend>
        <label className={styles.option}>
          <input
            type="radio"
            name="weekday"
            checked={choice === undefined}
            onChange={() => setChoice(undefined)}
          />
          Any day
        </label>
        {WEEKDAY_NAMES.map((name, index) => (
          <label key={name} className={styles.option}>
            <input
              type="radio"
              name="weekday"
              checked={choice === index}
              onChange={() => setChoice(index as Weekday)}
            />
            {name}
          </label>
        ))}
      </fieldset>
    </Sheet>
  );
}
