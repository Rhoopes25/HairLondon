import type { ReactNode } from 'react';
import { Avatar } from '../Avatar';
import { QuietLink } from '../Button';
import { RatingLine } from '../Stars';
import styles from './ProfileHeader.module.css';

export interface ProfileHeaderProps {
  name: string;
  photoUrl: string | null;
  photoSrcSet?: string;
  studio: string;
  city: string;
  average: number | null;
  reviewCount: number;
  /** Where "Read reviews" goes. Reviews are what builds trust, so the way in is right under her name. */
  reviewsTo?: string;
  bio: string;
  /** A small control beside the name, e.g. the save button. */
  aside?: ReactNode;
  /** The tab row with its Book button. */
  children: ReactNode;
}

/** Name, rating, and bio at the top of a stylist's profile, with the tab row below. */
export function ProfileHeader({
  name,
  photoUrl,
  photoSrcSet,
  studio,
  city,
  average,
  reviewCount,
  reviewsTo,
  bio,
  aside,
  children,
}: ProfileHeaderProps) {
  return (
    <section>
      <div className={styles.head}>
        <div className={styles.top}>
          <Avatar name={name} photoUrl={photoUrl} photoSrcSet={photoSrcSet} size="lg" />
          <div className={styles.who}>
            <h1>{name}</h1>
            <p className={styles.studio}>
              {studio}, {city}
            </p>
            <div className={styles.rating}>
              <RatingLine average={average} count={reviewCount} />
              {reviewsTo && reviewCount > 0 ? (
                <QuietLink to={reviewsTo}>Read reviews</QuietLink>
              ) : null}
            </div>
          </div>
          {aside ? <div className={styles.aside}>{aside}</div> : null}
        </div>
        <p className={styles.bio}>{bio}</p>
      </div>
      {children}
    </section>
  );
}

/** The row under the bio: tabs on the left, a Book action that stays in view on the right. */
export function TabRow({ children }: { children: ReactNode }) {
  return <div className={styles.tabRow}>{children}</div>;
}
