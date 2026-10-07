import { LinkButton } from '../Button';
import styles from './Hero.module.css';

export interface HeroProps {
  imageUrl: string;
  /** Describes the photo for screen readers. */
  imageLabel: string;
  title: string;
  /** One plain line saying what this is for. */
  tagline: string;
  ctaLabel: string;
  ctaTo: string;
}

/** The entry photo with the name, what the site is for, and the one main action over it. */
export function Hero({ imageUrl, imageLabel, title, tagline, ctaLabel, ctaTo }: HeroProps) {
  return (
    <div className={styles.frame}>
      <section
        className={styles.hero}
        aria-label={imageLabel}
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
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
