import { useState } from 'react';
import { cx } from '@app/lib/cx';
import styles from './PortfolioGrid.module.css';

export interface PortfolioPhotoView {
  /** Already resolved to a URL. */
  src: string;
  /** The same photo at several widths (see photoSrcSet). */
  srcSet?: string;
  alt: string;
}

/** The tile's width in the 2, 3 and 3 column layouts, so the browser picks the smallest sharp file. */
const TILE_SIZES =
  '(min-width: 1200px) 352px, (min-width: 900px) calc((100vw - 9rem) / 3), (min-width: 640px) calc((100vw - 5rem) / 3), calc((100vw - 4rem) / 2)';

export interface PortfolioGridProps {
  photos: readonly PortfolioPhotoView[];
  /** When given, each photo is a button that opens it larger. */
  onSelect?: (index: number) => void;
}

function Tile({ photo, onSelect }: { photo: PortfolioPhotoView; onSelect?: () => void }) {
  // If a photo fails to load, the warm gradient behind it shows instead of a broken icon.
  const [failed, setFailed] = useState(false);
  const image = failed ? null : (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={photo.srcSet ? TILE_SIZES : undefined}
      alt={photo.alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );

  return (
    <figure className={styles.card}>
      {onSelect ? (
        <button
          type="button"
          className={cx(styles.photo, styles.button)}
          onClick={onSelect}
          aria-label={`View larger: ${photo.alt}`}
        >
          {image}
        </button>
      ) : (
        <div className={styles.photo}>{image}</div>
      )}
    </figure>
  );
}

/** Grid of real client work: two columns on a phone, three from sm. */
export function PortfolioGrid({ photos, onSelect }: PortfolioGridProps) {
  return (
    <div className={styles.grid}>
      {photos.map((photo, index) => (
        <Tile
          key={photo.src}
          photo={photo}
          onSelect={onSelect ? () => onSelect(index) : undefined}
        />
      ))}
    </div>
  );
}
