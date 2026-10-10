import { useId } from 'react';
import styles from './ServiceOption.module.css';

export interface ServiceOptionProps {
  name: string;
  description: string;
  /** e.g. "1 hr · $65" */
  meta: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** A selectable service: a real checkbox, so keyboards and screen readers get it for free. */
export function ServiceOption({ name, description, meta, checked, onChange }: ServiceOptionProps) {
  const id = useId();
  return (
    <label className={styles.option} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.check} aria-hidden="true" />
      <span className={styles.body}>
        <span className={styles.name}>{name}</span>
        <span className={styles.desc}>{description}</span>
      </span>
      <span className={styles.meta}>{meta}</span>
    </label>
  );
}
