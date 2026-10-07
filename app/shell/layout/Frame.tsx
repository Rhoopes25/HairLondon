import type { ReactNode } from 'react';
import { ScrollRestoration } from 'react-router';
import { PrototypeStrip } from '@app/features/prototype-notice';
import { Footer } from './Footer';
import styles from './Frame.module.css';

/** The one centered column every screen lives in: early-prototype strip, the page, and the footer. */
export function Frame({ header, children }: { header?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <PrototypeStrip />
      {header}
      <main className={styles.main}>{children}</main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
