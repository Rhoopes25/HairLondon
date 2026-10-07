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
