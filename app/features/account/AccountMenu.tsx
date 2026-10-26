import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { initials } from '@src/domain/format/name';
import { queryString } from '@app/lib/links';
import { useAccount, useServices } from '@app/services';
import { Icon } from '@app/ui';
import styles from './AccountMenu.module.css';

/** How long the "Signed out" note stays, so she can see sign out worked without a dialog. */
const SIGNED_OUT_NOTE_MS = 3000;

/**
 * Top right of the header, where people look for an account. Signed out: a Sign in link that
 * returns her to this screen. Signed in: her initials, opening a small menu with her account and
 * Sign out. Booking never needs either; this only saves typing.
 */
export function AccountMenu() {
  const account = useAccount();
  const { accounts } = useServices();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Close on a click outside or Escape, the way menus behave everywhere else.
  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!signedOut) return;
    const timer = window.setTimeout(() => setSignedOut(false), SIGNED_OUT_NOTE_MS);
    return () => window.clearTimeout(timer);
  }, [signedOut]);

  // Close the menu when she moves to another screen from it.
  const [path, setPath] = useState(location.pathname);
  if (path !== location.pathname) {
    setPath(location.pathname);
    setOpen(false);
  }

  if (!account) {
    const here = `${location.pathname}${location.search}`;
    return (
      <div className={styles.wrap}>
        <Link
          to={`/account/sign-in${queryString({ back: here })}`}
          className={styles.signIn}
          aria-label="Sign in"
        >
          <Icon name="user" />
          <span className={styles.signInText} aria-hidden="true">
            Sign in
          </span>
        </Link>
        <p className={styles.note} aria-live="polite">
          {signedOut ? 'Signed out' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.avatar}
        aria-label={`Account: ${account.name}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
      >
        {initials(account.name)}
      </button>
      {open ? (
        <div id={menuId} className={styles.menu}>
          <p className={styles.name}>{account.name}</p>
          <p className={styles.meta}>Signed in on this device</p>
          <Link to="/account" className={styles.item}>
            My account
          </Link>
          <button
            type="button"
            className={styles.item}
            onClick={() => {
              accounts.signOut();
              setOpen(false);
              setSignedOut(true);
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
