import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Avatar } from '../Avatar';
import { RatingLine } from '../Stars';
import styles from './StylistCard.module.css';

export interface CardPhoto {
  src: string;
  srcSet?: string;
}

export interface CardSlot {
  /** On the chip: "Today, 1:00 PM". */
  label: string;
  to: string;
  /** Spoken in full, because the chip alone does not say who or which day: "Book Sadie, Thu, Oct 8 at 1:00 PM". */
  ariaLabel: string;
}

export interface StylistCardProps {
  /** Her profile. The name is the link, stretched over the whole card, so a tap anywhere opens it. */
  to: string;
  name: string;
  photoUrl: string | null;
  photoSrcSet?: string;
  studio: string;
  city: string;
  /** "2.1 mi away", once she has shared where she is. */
  distance?: string | null;
  average: number | null;
  reviewCount: number;
  /** "$65+" (the plus already says it is a starting price), or "$185+" with a line under it like "about 3 hr". */
  price?: { value: string; note?: string; detail?: string } | null;
  /** Up to three thumbnails of her work. */
  photos?: readonly CardPhoto[];
  /** Puts a "See all work" tile on the third photo spot. */
  seeAll?: { to: string; label: string };
  /** Her next open times, as chips that start a booking. */
  slots?: { heading: string; items: readonly CardSlot[] };
  footer?: ReactNode;
}

const THUMB_SIZES = '(min-width: 900px) 140px, 30vw';
const THUMB_COUNT = 3;

function SeeAll({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className={styles.seeAll} aria-label={label}>
      <span>
        See all
        <br />
        work →
      </span>
    </Link>
  );
}

/** Who she is, how well reviewed, her work, and the times she has open: enough to choose and tap. */
export function StylistCard({
  to,
  name,
  photoUrl,
  photoSrcSet,
  studio,
  city,
  distance,
  average,
  reviewCount,
  price,
  photos = [],
  seeAll,
  slots,
  footer,
}: StylistCardProps) {
  const shown = photos.slice(0, THUMB_COUNT);
  // With fewer than three photos the tile still goes on the last spot, over the warm placeholder.
  const emptySpots = seeAll ? Math.max(0, THUMB_COUNT - shown.length) : 0;

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <Avatar name={name} photoUrl={photoUrl} photoSrcSet={photoSrcSet} />
        <div className={styles.body}>
          <Link to={to} className={styles.name}>
            {name}
          </Link>
          <span className={styles.studio}>
            {studio}, {city}
            {distance ? <span className={styles.distance}> · {distance}</span> : null}
          </span>
          <RatingLine average={average} count={reviewCount} />
        </div>
        {price ? (
          <div className={styles.price}>
            {price.note ? <span className={styles.priceNote}>{price.note}</span> : null}
            <span className={styles.priceValue}>{price.value}</span>
            {price.detail ? <span className={styles.priceNote}>{price.detail}</span> : null}
          </div>
        ) : null}
      </div>

      {shown.length || emptySpots ? (
        <div className={styles.thumbs}>
          {shown.map((photo, index) => (
            <span key={photo.src} className={styles.thumb}>
              <img
                src={photo.src}
                srcSet={photo.srcSet}
                sizes={photo.srcSet ? THUMB_SIZES : undefined}
                alt=""
                loading="lazy"
              />
              {seeAll && index === THUMB_COUNT - 1 ? <SeeAll {...seeAll} /> : null}
            </span>
          ))}
          {seeAll
            ? Array.from({ length: emptySpots }, (_, index) => (
                <span key={`empty-${index}`} className={styles.thumb}>
                  {index === emptySpots - 1 ? <SeeAll {...seeAll} /> : null}
                </span>
              ))
            : null}
        </div>
      ) : null}

      {slots ? (
        <div className={styles.slots}>
          <span className={styles.slotsHeading}>{slots.heading}</span>
          <div className={styles.slotRow}>
            {slots.items.map((slot) => (
              <Link key={slot.to} to={slot.to} className={styles.slot} aria-label={slot.ariaLabel}>
                {slot.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </article>
  );
}
