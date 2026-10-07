import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { firstName } from '@src/domain/format/name';
import { assetUrl } from '@app/config';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useStylist } from '@app/services';
import { BackLink, LinkButton } from '@app/ui';
import styles from './PhotoViewerPage.module.css';

/** One photo of her work, large, with next and previous. Left and right arrow keys work too. */
export function PhotoViewerPage() {
  const { id, n } = useParams();
  const stylist = useStylist(id);
  const navigate = useNavigate();
  // Remember which photo failed to load (not just "one failed"), so moving to the next photo resets it.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  useDocumentTitle(stylist ? `${stylist.name}’s work` : 'Photo');

  const photos = stylist?.portfolio ?? [];
  const index = Number(n);
  const valid = Number.isInteger(index) && index >= 0 && index < photos.length;

  useEffect(() => {
    if (!stylist || !valid) return;
    const prev = (index - 1 + photos.length) % photos.length;
    const next = (index + 1) % photos.length;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft')
        navigate(`/stylists/${stylist?.id}/photos/${prev}`, { replace: true });
      if (event.key === 'ArrowRight')
        navigate(`/stylists/${stylist?.id}/photos/${next}`, { replace: true });
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stylist, valid, index, photos.length, navigate]);

  if (!stylist) return <Navigate to="/stylists" replace />;
  const photo = photos[index];
  if (!valid || !photo) return <Navigate to={`/stylists/${stylist.id}`} replace />;

  const prev = (index - 1 + photos.length) % photos.length;
  const next = (index + 1) % photos.length;

  return (
    <>
      <BackLink to={`/stylists/${stylist.id}/portfolio`}>
        Back to {firstName(stylist.name)}’s work
      </BackLink>
      <h1 className="visually-hidden">
        {stylist.name}’s work, photo {index + 1} of {photos.length}
      </h1>
      <figure className={styles.figure}>
        <div className={styles.frame}>
          {failedSrc === photo.src ? null : (
            <img
              src={assetUrl(photo.src)}
              alt={photo.alt}
              onError={() => setFailedSrc(photo.src)}
            />
          )}
        </div>
        <figcaption>{photo.alt}</figcaption>
      </figure>

      <nav className={styles.pager} aria-label="Photos">
        <LinkButton
          to={`/stylists/${stylist.id}/photos/${prev}`}
          replace
          variant="outline"
          size="sm"
        >
          Previous
        </LinkButton>
        <span aria-live="polite">
          {index + 1} of {photos.length}
        </span>
        <LinkButton
          to={`/stylists/${stylist.id}/photos/${next}`}
          replace
          variant="outline"
          size="sm"
        >
          Next
        </LinkButton>
      </nav>

      <div className={styles.cta}>
        <LinkButton to={`/book/${stylist.id}`} fullWidth>
          Book with {firstName(stylist.name)}
        </LinkButton>
      </div>
    </>
  );
}
