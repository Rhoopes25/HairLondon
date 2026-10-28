import type { ReactNode } from 'react';
import { LinkButton } from '../Button';
import styles from './Hero.module.css';

export interface HeroAction {
  label: string;
  to: string;
  /** For a screen reader, when the label alone would be vague (e.g. which visit "Book Again" copies). */
  ariaLabel?: string;
  /**
   * One action is filled (`primary`) and the rest are `outline`, so two side-by-side buttons
   * never compete. Defaults to `primary`.
   */
  variant?: 'primary' | 'outline';
}

export interface HeroProps {
  imageUrl: string;
  /** The same photo at several widths (see photoSrcSet), so each screen downloads the right one. */
  imageSrcSet?: string;
  /** Describes the photo for screen readers. */
  imageLabel: string;
  title: string;
  /** One plain line saying what this is for. */
  tagline: string;
  /** The ways in, side by side. Make exactly one `primary`; the others are `outline`. */
  actions: readonly HeroAction[];
  /** Something quieter under the buttons, such as her next visit when she is signed in. */
  extra?: ReactNode;
}

/** On a phone the photo is wide as the column; from md it takes half the width (see Hero.module.css). */
const PHOTO_SIZES = '(min-width: 900px) 45vw, 100vw';

/**
 * The entry photo, then the name, what the site is for, and the ways in. No text sits on the
 * photo, so nothing clashes with the portrait: on a phone the text is below it, on desktop beside it.
 */
export function Hero({
  imageUrl,
  imageSrcSet,
  imageLabel,
  title,
  tagline,
  actions,
  extra,
}: HeroProps) {
  return (
    <div className={styles.frame}>
      <section className={styles.hero} aria-label={imageLabel}>
        <img
          className={styles.photo}
          src={imageUrl}
          srcSet={imageSrcSet}
          sizes={imageSrcSet ? PHOTO_SIZES : undefined}
          alt=""
        />
        <div className={styles.text}>
          <h1>{title}</h1>
          <p>{tagline}</p>
          <div className={styles.actions}>
            {actions.map((action) => (
              <LinkButton
                key={action.to}
                to={action.to}
                variant={action.variant ?? 'primary'}
                aria-label={action.ariaLabel}
              >
                {action.label}
              </LinkButton>
            ))}
          </div>
          {extra ? <div className={styles.extra}>{extra}</div> : null}
        </div>
      </section>
    </div>
  );
}
