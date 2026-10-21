import { assetUrl, photoSrcSet } from '@app/config';
import { NextVisitCard } from '@app/features/account';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useAccount } from '@app/services';
import { Hero, QuietLink } from '@app/ui';

/**
 * The entry screen. The first and biggest thing says what this is for (local stylists you can
 * trust, with real work to look at), and the two ways in are the main actions on it: book a time,
 * or meet the stylists first. Under them, quieter: her next visit when she is signed in, or a
 * small sign-in link when she is not. Nothing competes with the two buttons.
 */
export function HomePage() {
  const account = useAccount();
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
      extra={
        account ? (
          <NextVisitCard account={account} />
        ) : (
          <span>
            Booked before? <QuietLink to="/account">Sign in</QuietLink>
          </span>
        )
      }
    />
  );
}
