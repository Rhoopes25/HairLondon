import { cx } from '@app/lib/cx';
import { initials } from '@src/domain/format/name';
import styles from './Avatar.module.css';

export interface AvatarProps {
  name: string;
  /** Already resolved to a URL (see assetUrl). Initials are shown when absent. */
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Circle photo, or initials until the stylist adds one. Decorative: the name is always shown beside it. */
export function Avatar({ name, photoUrl, size = 'md', className }: AvatarProps) {
  const classes = cx(styles.avatar, styles[size], !photoUrl && styles.initials, className);
  if (photoUrl) {
    return (
      <span className={classes}>
        <img src={photoUrl} alt="" />
      </span>
    );
  }
  return (
    <span className={classes} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
