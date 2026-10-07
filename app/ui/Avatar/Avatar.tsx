import { cx } from '@app/lib/cx';
import { initials } from '@src/domain/format/name';
import styles from './Avatar.module.css';

export interface AvatarProps {
  name: string;
  /** Already resolved to a URL (see assetUrl). Initials are shown when absent. */
  photoUrl?: string | null;
  /** The same photo at several widths (see photoSrcSet). An avatar is small, so the smallest is chosen. */
  photoSrcSet?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AVATAR_SIZES = { sm: '32px', md: '52px', lg: '80px' } as const;

/** Circle photo, or initials until the stylist adds one. Decorative: the name is always shown beside it. */
export function Avatar({ name, photoUrl, photoSrcSet, size = 'md', className }: AvatarProps) {
  const classes = cx(styles.avatar, styles[size], !photoUrl && styles.initials, className);
  if (photoUrl) {
    return (
      <span className={classes}>
        <img
          src={photoUrl}
          srcSet={photoSrcSet}
          sizes={photoSrcSet ? AVATAR_SIZES[size] : undefined}
          alt=""
        />
      </span>
    );
  }
  return (
    <span className={classes} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
