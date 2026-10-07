import { Link } from 'react-router';
import { formatPriceRange } from '@src/domain/format/price';
import { SERVICE_IDS } from '@src/domain/models/service';
import { priceRange } from '@src/domain/pricing/totals';
import { assetUrl } from '@app/config';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useServices, useStylists } from '@app/services';
import { Hero, QuietLink, Section } from '@app/ui';
import styles from './HomePage.module.css';

/**
 * The entry screen. The first and biggest thing says what this is for (see real work, then book);
 * everything else is quieter and offers a different way in.
 */
export function HomePage() {
  const { catalog } = useServices();
  const stylists = useStylists();
  useDocumentTitle('Find a stylist you trust');

  return (
    <>
      <Hero
        imageUrl={assetUrl('images/home.jpg')}
        imageLabel="A stylist holding her shears"
        title="Hair by London"
        tagline="See real client work and reviews, then book a time that fits your day."
        ctaLabel="Find a stylist"
        ctaTo="/stylists"
      />

      <Section title="What are you booking?">
        <div className={styles.shortcuts}>
          {SERVICE_IDS.map((id) => {
            const range = priceRange(stylists, id);
            if (!range) return null;
            return (
              <Link key={id} to={`/stylists?service=${id}`} className={styles.shortcut}>
                <span className={styles.name}>{catalog[id].name}</span>
                <span className={styles.price}>{formatPriceRange(range.min, range.max)}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      <p className={styles.returning}>
        Already booked? <QuietLink to="/appointments">See my appointments</QuietLink>
      </p>
    </>
  );
}
