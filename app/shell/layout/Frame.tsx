import type { ReactNode } from 'react';
import { ScrollRestoration } from 'react-router';
import { PrototypeStrip } from '@app/features/prototype-notice';
import { Container } from '@app/ui';
import { Footer } from './Footer';
import styles from './Frame.module.css';

/**
 * The website frame every screen lives in: the early-prototype strip, the header, the page, and
 * the footer. The strip, header and footer are full-width bands; the page itself sits in a
 * centered container.
 */
export function Frame({
  header,
  contained = true,
  children,
}: {
  header?: ReactNode;
  /**
   * Put the page in the centered container. Booking turns this off because its own header is part
   * of the page and has to be a full-width band, so each step contains the rest of itself.
   */
  contained?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.frame}>
      <PrototypeStrip />
      {header}
      {contained ? (
        <Container as="main" className={styles.main}>
          {children}
        </Container>
      ) : (
        <main className={styles.main}>{children}</main>
      )}
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
