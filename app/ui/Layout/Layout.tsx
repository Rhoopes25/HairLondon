import type { ReactNode, Ref } from 'react';
import { cx } from '@app/lib/cx';
import styles from './Layout.module.css';

/** The screen title block: one h1 and an optional line under it. */
export function PageIntro({
  title,
  children,
  titleRef,
}: {
  title: string;
  children?: ReactNode;
  /** Booking steps move focus to the new heading. */
  titleRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <section className={styles.intro}>
      <h1 ref={titleRef} tabIndex={titleRef ? -1 : undefined}>
        {title}
      </h1>
      {children ? <p>{children}</p> : null}
    </section>
  );
}

/**
 * The page-width column: centered, at most `--container-max` wide, with side gutters that only
 * exist on desktop. Components keep their own side padding, so on a phone this adds nothing.
 */
export function Container({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'main';
}) {
  return <Tag className={cx(styles.container, className)}>{children}</Tag>;
}

/** A readable single column (`--container-narrow`) for forms, recaps, confirmations and help. */
export function Narrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.narrow, className)}>{children}</div>;
}

/**
 * Choices on the left, and on desktop a sticky panel (summary and action) on the right. On a phone
 * and in a narrow window it is one column with the panel last, so the order never changes: the
 * panel comes after the choices in the DOM too, which keeps keyboard order the same as reading order.
 */
export function SplitLayout({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.split}>
      <div className={styles.splitMain}>{children}</div>
      <div className={styles.splitAside}>{aside}</div>
    </div>
  );
}

/** A titled block of a screen, e.g. "Choose a day". */
export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx(styles.section, className)}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** Quiet explanatory text for an empty list or panel. */
export function EmptyNote({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx(styles.empty, className)}>{children}</p>;
}
