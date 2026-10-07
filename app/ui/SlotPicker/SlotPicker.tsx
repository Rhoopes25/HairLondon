import { cx } from '@app/lib/cx';
import styles from './SlotPicker.module.css';

export interface DayOption {
  /** Stable identity, e.g. the ISO date. */
  id: string;
  weekday: string;
  dayNum: number;
  month: string;
  /** Full spoken label, e.g. "Thu, Oct 16". */
  label: string;
}

export interface DaysProps {
  days: readonly DayOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** A scrolling strip of day chips. Each is a real toggle button. */
function Days({ days, selectedId, onSelect }: DaysProps) {
  return (
    <div className={styles.days} role="group" aria-label="Day">
      {days.map((day) => {
        const selected = day.id === selectedId;
        return (
          <button
            key={day.id}
            type="button"
            className={cx(styles.day, selected && styles.daySelected)}
            aria-pressed={selected}
            aria-label={day.label}
            onClick={() => onSelect(day.id)}
          >
            <span>{day.weekday}</span>
            <span className={styles.dayNum}>{day.dayNum}</span>
            <span className={styles.dayMonth}>{day.month}</span>
          </button>
        );
      })}
    </div>
  );
}

export interface TimeOption {
  id: number;
  label: string;
  available: boolean;
}

export interface TimesProps {
  times: readonly TimeOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** Shown instead of the grid, e.g. "Select a day to see available times". */
  placeholder?: string;
  /** Shown above the grid when nothing is open that day. */
  emptyMessage?: string;
}

/** A three-column grid of times. Unavailable times are disabled and struck through, not just grayed. */
function Times({ times, selectedId, onSelect, placeholder, emptyMessage }: TimesProps) {
  if (placeholder) {
    return (
      <div className={styles.times}>
        <p className={styles.note}>{placeholder}</p>
      </div>
    );
  }
  return (
    <div className={styles.times} role="group" aria-label="Time">
      {emptyMessage ? <p className={styles.note}>{emptyMessage}</p> : null}
      {times.map((time) => {
        const selected = time.id === selectedId;
        return (
          <button
            key={time.id}
            type="button"
            className={cx(
              styles.slot,
              selected && styles.slotSelected,
              !time.available && styles.slotUnavailable,
            )}
            aria-pressed={selected}
            disabled={!time.available}
            onClick={() => onSelect(time.id)}
          >
            {time.label}
          </button>
        );
      })}
    </div>
  );
}

/** Two steps in one: choose a day, then a time. Compose `SlotPicker.Days` and `SlotPicker.Times`. */
export const SlotPicker = { Days, Times };
