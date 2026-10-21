import styles from './AccountForms.module.css';

/** Says plainly what this sign-in is and is not, as the prototype rules ask. */
export function PretendNote() {
  return (
    <p className={styles.note}>
      Prototype: accounts are pretend. There&rsquo;s no password, and your details stay on this
      device.
    </p>
  );
}
