import { assetUrl, photoSrcSet } from '@app/config';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { Hero } from '@app/ui';

/**
 * The entry screen. The first and biggest thing says what this is for (local stylists you can
 * trust, with real work to look at), and the two ways in are the only actions on it: book a time,
 * or meet the stylists first. Nothing else competes with them.
 */
export function HomePage() {
  useDocumentTitle('Find a stylist you trust');

  return (
    <Hero
      imageUrl={assetUrl('images/home.jpg')}
      imageSrcSet={photoSrcSet('images/home.jpg')}
      imageLabel="A stylist holding her shears"
      title="Local Locks"
      tagline="Local stylists you can trust."
      actions={[
        { label: 'Book Now', to: '/book' },
        { label: 'Explore Stylists', to: '/stylists' },
      ]}
    />
  );
}
