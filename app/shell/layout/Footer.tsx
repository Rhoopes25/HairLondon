import { Link } from 'react-router';
import { useNotice } from '@app/features/prototype-notice';
import { Container } from '@app/ui';
import styles from './Footer.module.css';

export function Footer() {
  const { open } = useNotice();
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.inner}>
          <nav aria-label="More" className={styles.links}>
            <Link to="/help">How booking works</Link>
            <button type="button" onClick={open}>
              About this prototype
            </button>
          </nav>
          <p>&copy; 2026 Hair by London</p>
        </div>
      </Container>
    </footer>
  );
}
