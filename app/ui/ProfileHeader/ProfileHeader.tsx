import type { ReactNode } from 'react';
import { Avatar } from '../Avatar';
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
            <RatingLine average={average} count={reviewCount} />
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
