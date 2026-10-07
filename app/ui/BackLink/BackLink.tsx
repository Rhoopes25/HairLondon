import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from '../Icon';
import styles from './BackLink.module.css';

/** A quiet "back to ..." link at the top of a screen, so there is always a way out that says where it goes. */
export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={styles.back}>
      <Icon name="chevron-left" />
      {children}
    </Link>
  );
}
