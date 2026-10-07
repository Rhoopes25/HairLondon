import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { cx } from '@app/lib/cx';
import { Icon } from '../Icon';
import styles from './NavBar.module.css';

/** The sticky header strip. Content goes in slots so other headers (booking) can reuse it. */
export function HeaderBar({ children, className }: { children: ReactNode; className?: string }) {
  return <header className={cx(styles.header, className)}>{children}</header>;
}

export interface NavLinkItem {
  to: string;
  label: string;
  /** Match only this exact path (Home), not everything under it. */
  end?: boolean;
}

export interface NavBarProps {
  homeTo: string;
  links: readonly NavLinkItem[];
}

/** Logo that links home, plus the main links. The current one is marked with aria-current. */
export function NavBar({ homeTo, links }: NavBarProps) {
  return (
    <HeaderBar>
      <Link to={homeTo} className={styles.logo} aria-label="Hair by London, home">
        <Icon name="scissors" />
      </Link>
      <nav className={styles.nav} aria-label="Main">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => cx(styles.link, isActive && styles.active)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </HeaderBar>
  );
}
