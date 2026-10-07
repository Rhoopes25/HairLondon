import { Link } from 'react-router';
import { Avatar } from '../Avatar';
import { RatingLine } from '../Stars';
import styles from './StylistCard.module.css';

export interface StylistCardProps {
  to: string;
  name: string;
  photoUrl: string | null;
  studio: string;
  city: string;
  average: number | null;
  reviewCount: number;
  /** e.g. "From $30" */
  priceText: string | null;
}

/** One stylist in a list: who, where, how well reviewed, and what it costs. */
export function StylistCard({
  to,
  name,
  photoUrl,
  studio,
  city,
  average,
  reviewCount,
  priceText,
}: StylistCardProps) {
  return (
    <Link to={to} className={styles.card}>
      <Avatar name={name} photoUrl={photoUrl} />
      <span className={styles.body}>
        <span className={styles.name}>{name}</span>
        <span className={styles.studio}>
          {studio}, {city}
        </span>
        <RatingLine average={average} count={reviewCount} />
      </span>
      {priceText ? <span className={styles.price}>{priceText}</span> : null}
    </Link>
  );
}
