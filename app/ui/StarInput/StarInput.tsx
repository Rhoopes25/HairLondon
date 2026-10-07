import { useId } from 'react';
import styles from './StarInput.module.css';

export interface StarInputProps {
  /** 0 means nothing chosen yet. */
  value: number;
  onChange: (stars: number) => void;
  /** The question, e.g. "How was your visit?" */
  legend: string;
  error?: string;
}

/** Choose 1 to 5 stars. Native radio buttons, so arrow keys and screen readers just work. */
export function StarInput({ value, onChange, legend, error }: StarInputProps) {
  const name = useId();
  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? `${name}-error` : undefined}>
      <legend>{legend}</legend>
      <div className={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={styles.star}>
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="visually-hidden"
            />
            <span aria-hidden="true" className={n <= value ? styles.on : styles.off}>
              {n <= value ? '★' : '☆'}
            </span>
            <span className="visually-hidden">
              {n} {n === 1 ? 'star' : 'stars'}
            </span>
          </label>
        ))}
      </div>
      <span id={`${name}-error`} className={styles.error} role={error ? 'alert' : undefined}>
        {error ?? ''}
      </span>
    </fieldset>
  );
}
