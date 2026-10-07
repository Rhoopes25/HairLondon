import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@app/lib/cx';
import { Icon } from '../Icon';
import styles from './Modal.module.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Action buttons pinned under the content. */
  footer?: ReactNode;
  /** "center" is a dialog, "bottom" is a sheet that rises from the bottom edge. */
  placement?: 'center' | 'bottom';
  /** When false, Escape, the backdrop, and the close button do nothing. */
  dismissible?: boolean;
}

/**
 * An accessible overlay: labelled, traps focus, closes on Escape and backdrop click,
 * locks page scroll, and returns focus to whatever opened it.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  placement = 'center',
  dismissible = true,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? panel)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [open]);

  if (!open) return null;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && dismissible) {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div
      role="presentation"
      className={cx(styles.backdrop, placement === 'bottom' && styles.backdropBottom)}
      onMouseDown={dismissible ? onClose : undefined}
    >
      {/* The panel stops the backdrop's click-to-close; keyboard handling covers Escape and Tab. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(styles.panel, placement === 'bottom' ? styles.sheet : styles.dialog)}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          {dismissible ? (
            <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
              <Icon name="close" />
            </button>
          ) : null}
        </div>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

/** A bottom sheet: the same overlay anchored to the bottom edge. */
export function Sheet(props: Omit<ModalProps, 'placement'>) {
  return <Modal {...props} placement="bottom" />;
}
