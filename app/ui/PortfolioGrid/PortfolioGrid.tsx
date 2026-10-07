import { useState } from 'react';
import { cx } from '@app/lib/cx';
import styles from './PortfolioGrid.module.css';

export interface PortfolioPhotoView {
  /** Already resolved to a URL. */
  src: string;
  alt: string;
}

export interface PortfolioGridProps {
  photos: readonly PortfolioPhotoView[];
  /** When given, each photo is a button that opens it larger. */
  onSelect?: (index: number) => void;
}

function Tile({ photo, onSelect }: { photo: PortfolioPhotoView; onSelect?: () => void }) {
  // If a photo fails to load, the warm gradient behind it shows instead of a broken icon.
  const [failed, setFailed] = useState(false);
  const image = failed ? null : (
    <img src={photo.src} alt={photo.alt} loading="lazy" onError={() => setFailed(true)} />
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

/** Two-column grid of real client work. */
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
