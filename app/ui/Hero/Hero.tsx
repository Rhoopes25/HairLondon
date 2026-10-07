import { LinkButton } from '../Button';
import styles from './Hero.module.css';

export interface HeroProps {
  imageUrl: string;
  /** The same photo at several widths (see photoSrcSet), so each screen downloads the right one. */
  imageSrcSet?: string;
  /** Describes the photo for screen readers. */
  imageLabel: string;
  title: string;
  /** One plain line saying what this is for. */
  tagline: string;
  ctaLabel: string;
  ctaTo: string;
}

/** On a phone the photo is wide as the column; from md it takes half the width (see Hero.module.css). */
const PHOTO_SIZES = '(min-width: 900px) 45vw, 100vw';

/**
 * The entry photo with the name, what the site is for, and the one main action. On a phone the
 * text sits over the photo; on desktop it sits beside it, so nothing covers the portrait.
 */
export function Hero({
  imageUrl,
  imageSrcSet,
  imageLabel,
  title,
  tagline,
  ctaLabel,
  ctaTo,
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
        <div className={styles.overlay}>
          <h1>{title}</h1>
          <p>{tagline}</p>
          <LinkButton to={ctaTo} variant="onPhoto">
            {ctaLabel}
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
