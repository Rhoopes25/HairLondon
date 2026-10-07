import { useId } from 'react';
import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react';
import { cx } from '@app/lib/cx';
import styles from './TextField.module.css';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  /** Shown under the field. Setting it also marks the field invalid. */
  error?: string;
  inputRef?: Ref<HTMLInputElement>;
}

/** Label, input, optional hint and error, wired together for screen readers. */
export function TextField({
  label,
  hint,
  error,
  inputRef,
  className,
  id,
  ...rest
}: TextFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        ref={inputRef}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {hint ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
      <span id={errorId} className={styles.error} role={error ? 'alert' : undefined}>
        {error ?? ''}
      </span>
    </div>
  );
}

export interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

/** Same wiring as TextField, for longer text. */
export function TextAreaField({
  label,
  hint,
  error,
  className,
  id,
  rows = 4,
  ...rest
}: TextAreaFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={inputId}>{label}</label>
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {hint ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
      <span id={errorId} className={styles.error} role={error ? 'alert' : undefined}>
        {error ?? ''}
      </span>
    </div>
  );
}
