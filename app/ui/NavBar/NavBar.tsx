import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { cx } from '@app/lib/cx';
import { Icon } from '../Icon';
import { Container } from '../Layout';
import styles from './NavBar.module.css';

/**
 * The sticky header band. It is full width; its content sits in the page container so it lines up
 * with the page below. Content goes in slots so other headers (booking) can reuse it.
 */
export function HeaderBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <header className={cx(styles.header, className)}>
      <Container>
        <div className={styles.inner}>{children}</div>
      </Container>
    </header>
  );
}

export interface NavLinkItem {
  to: string;
  label: string;
  /** Match only this exact path (Home), not everything under it. */
  end?: boolean;
  /** Hidden on phones, where the logo already does the same job (Home), to make room. */
  fromSm?: boolean;
}

export interface NavBarProps {
  homeTo: string;
  links: readonly NavLinkItem[];
  /** The landmark's name. Only needs changing if a second navigation is on the same page. */
  label?: string;
  /** Sits at the far right, after the links: the sign in / account control. */
  end?: ReactNode;
}

/** Logo that links home, plus the main links. The current one is marked with aria-current. */
export function NavBar({ homeTo, links, label = 'Main', end }: NavBarProps) {
  return (
    <HeaderBar>
      <Link to={homeTo} className={styles.logo} aria-label="Local Locks, home">
        <Icon name="scissors" />
        {/* The link is already named by aria-label; this is the visible text from sm up. */}
        <span className={styles.wordmark} aria-hidden="true">
          Local Locks
        </span>
      </Link>
      <nav className={styles.nav} aria-label={label}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cx(styles.link, isActive && styles.active, link.fromSm && styles.fromSm)
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      {end ? <div className={styles.end}>{end}</div> : null}
    </HeaderBar>
  );
}
