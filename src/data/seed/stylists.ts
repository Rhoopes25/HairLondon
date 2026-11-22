import type { PortfolioPhoto, Stylist } from '../../domain/models/stylist';
import {
  BROOKE_REVIEWS,
  DIEGO_REVIEWS,
  KAI_REVIEWS,
  LONDON_REVIEWS,
  MARCUS_REVIEWS,
  SADIE_REVIEWS,
} from './reviews';

/**
 * Photos that really are this stylist's work. The caption names the hair and the service.
 */
function work(src: string, alt: string, caption: string): PortfolioPhoto {
  return { src, alt, caption };
}

/**
 * PLACEHOLDER: a real photo borrowed from another stylist's gallery so this one is not thin.
 * The caption describes what the photo actually shows. Swap in her own photo, then use `work`.
 * Find every one with `placeholder: true`, or by searching this file for "borrowed(".
 */
function borrowed(src: string, alt: string, caption: string): PortfolioPhoto {
  return { src, alt, caption, placeholder: true };
}

/**
 * PLACEHOLDER: a generated tile that says "Placeholder" on it, standing in for a men's, beard, or
 * kids' cut photo we do not have yet. Swap in a real photo, then use `work`.
 * Find every one by searching this file for "standIn(".
 */
function standIn(src: string, caption: string): PortfolioPhoto {
  return {
    src,
    alt: `Placeholder image standing in for a photo of: ${caption}`,
    caption,
    placeholder: true,
  };
}

/**
 * Sample stylists. To add one, copy an entry, give it a unique id, and fill in the details.
 * Photo paths are relative to the app's public folder; the app resolves them against the base URL.
 * Days of the week use JavaScript numbering: 0 = Sunday ... 6 = Saturday.
 * Every stylist has at least six portfolio photos and at least fifty (made-up) reviews, which
 * live in ./reviews.ts.
 */
export const STYLISTS: readonly Stylist[] = [
  {
    id: 'london',
    name: 'London',
    studio: 'Hair by London',
    city: 'Provo',
    photo: 'images/home.jpg',
    bio: 'Lived-in blondes, soft color, and cuts that grow out well. Relaxed chair, no pressure.',
    story:
      'I started doing hair in my mom’s kitchen and never stopped. I love color that still looks good three months later, so you are not stuck coming back every few weeks. I’m a mom too, so if you need to bring a baby in a car seat, that’s fine.',
    yearsDoingHair: 8,
    specialties: ['Lived-in blonde', 'Soft color', 'Low-upkeep cuts'],
    areas: ['blonde', 'color'],
    location: { address: '184 N University Ave, Provo, UT', lat: 40.2361, lng: -111.6585 },
    workDays: [2, 3, 4, 5, 6],
    prices: {
      haircut: 65,
      color: 120,
      highlights: 150,
      blowout: 45,
      'root-touch-up': 80,
      'deep-conditioning': 35,
      'mens-haircut': 50,
      'kids-cut': 35,
    },
    portfolio: [
      work(
        'images/work-2.jpg',
        'Glossy jet black hair in long, soft layers',
        'Soft layers and gloss, long dark hair',
      ),
      work(
        'images/work-1.jpg',
        'Icy platinum balayage on long, loose waves',
        'Icy platinum balayage, long wavy hair',
      ),
      work(
        'images/work-4.jpg',
        'Bronde waves blended from root to ends, seen from the back',
        'Bronde balayage, long wavy hair',
      ),
      work(
        'images/work-6.jpg',
        'Soft golden brown hair with long face-framing layers',
        'Golden brown color with face-framing layers, long straight hair',
      ),
      work(
        'images/work-3.jpg',
        'Ash blonde balayage with curtain bangs',
        'Ash blonde balayage with curtain bangs, long hair',
      ),
      work(
        'images/work-5.jpg',
        'Creamy blonde highlights on long waves, seen from the back',
        'Creamy blonde highlights, long wavy hair',
      ),
      standIn('images/placeholder-mens-1.jpg', 'Men’s taper with a textured top, short wavy hair'),
      standIn('images/placeholder-kids-1.jpg', 'Kids’ cut, short straight hair'),
    ],
    reviews: LONDON_REVIEWS,
  },
  {
    id: 'sadie',
    name: 'Sadie Morgan',
    studio: 'Juniper Hair Studio',
    city: 'Orem',
    photo: null,
    bio: 'Color specialist. Rich brunettes, soft pastels, and gray coverage that looks natural.',
    story:
      'Color is my favorite part of the job. I’ll talk through what you want before we start, show you swatches, and tell you honestly how long it will last. Gray coverage that looks like your own hair is my specialty.',
    yearsDoingHair: 6,
    specialties: ['Brunettes', 'Gray coverage', 'Pastels'],
    areas: ['color'],
    location: { address: '620 S State St, Orem, UT', lat: 40.2881, lng: -111.6946 },
    workDays: [1, 3, 4, 5, 6],
    prices: { haircut: 55, color: 110, highlights: 165, 'root-touch-up': 75, blowout: 40 },
    portfolio: [
      work(
        'images/sadie-1.jpg',
        'Deep brunette with soft caramel highlights, curled into loose waves',
        'Caramel highlights on deep brunette, long curled hair',
      ),
      work(
        'images/sadie-2.jpg',
        'Long lavender waves with a soft, deeper root',
        'Lavender pastel color, long wavy hair',
      ),
      borrowed(
        'images/work-2.jpg',
        'Glossy jet black hair in long, soft layers',
        'Rich dark color with soft layers, long hair',
      ),
      borrowed(
        'images/work-6.jpg',
        'Soft golden brown hair with long face-framing layers',
        'Golden brown color with face-framing layers, long straight hair',
      ),
      borrowed(
        'images/work-4.jpg',
        'Bronde waves blended from root to ends, seen from the back',
        'Bronde blend, long wavy hair',
      ),
      borrowed(
        'images/work-3.jpg',
        'Ash blonde balayage with curtain bangs',
        'Smoky ash blonde, long hair',
      ),
    ],
    reviews: SADIE_REVIEWS,
  },
  {
    id: 'kai',
    name: 'Kai Nakamura',
    studio: 'The Loft Salon',
    city: 'Lehi',
    photo: null,
    bio: 'Short cuts, bobs, and shapes that are easy to style at home in five minutes. Men’s and kids’ cuts too.',
    story:
      'I keep things simple: a cut you can style in five minutes with what you already own. Most of my clients are in and out in under an hour, and I’ll show you how to do it yourself at home. Short hair on anyone, any age, is what I like best.',
    yearsDoingHair: 4,
    specialties: ['Short cuts', 'Bobs', 'Quick visits'],
    areas: ['cuts', 'mens'],
    location: { address: '350 W Main St, Lehi, UT', lat: 40.3916, lng: -111.8566 },
    workDays: [1, 2, 3, 4, 5],
    prices: {
      haircut: 45,
      color: 95,
      blowout: 35,
      'deep-conditioning': 30,
      'mens-haircut': 38,
      'beard-trim': 20,
      'kids-cut': 28,
    },
    portfolio: [
      work(
        'images/kai-1.jpg',
        'Straight, blunt-cut blonde lob, seen from the back',
        'Blunt-cut lob, straight blonde hair',
      ),
      work(
        'images/kai-2.jpg',
        'Copper and brunette bob with a hidden blonde underlayer',
        'Copper and brunette bob, straight hair',
      ),
      standIn('images/placeholder-mens-2.jpg', 'Men’s textured crop, short wavy hair'),
      standIn('images/placeholder-beard-1.jpg', 'Beard trim and neckline, short full beard'),
      standIn('images/placeholder-kids-2.jpg', 'Kids’ cut, short straight hair'),
      borrowed(
        'images/work-6.jpg',
        'Soft golden brown hair with long face-framing layers',
        'Layered haircut, long straight hair',
      ),
    ],
    reviews: KAI_REVIEWS,
  },
  {
    id: 'brooke',
    name: 'Brooke Ellis',
    studio: 'Wildflower Hair Co.',
    city: 'Springville',
    photo: null,
    bio: 'Blonding and dimensional highlights. I plan your color so you can go longer between visits.',
    story:
      'I plan your color around your life, not the other way around. We’ll pick a look that grows out softly so you can go longer between visits, which is good for your hair and your schedule.',
    yearsDoingHair: 10,
    specialties: ['Dimensional highlights', 'Blonding', 'Grow-out plans'],
    areas: ['blonde'],
    location: { address: '95 S Main St, Springville, UT', lat: 40.1638, lng: -111.6107 },
    workDays: [3, 4, 5, 6],
    prices: {
      haircut: 60,
      color: 130,
      highlights: 175,
      'root-touch-up': 85,
      'deep-conditioning': 40,
    },
    portfolio: [
      work(
        'images/brooke-1.jpg',
        'Long caramel and honey highlights with soft curled ends, seen from the back',
        'Caramel and honey highlights, long wavy hair',
      ),
      work(
        'images/brooke-2.jpg',
        'Dark root melting into ash blonde balayage on loose waves',
        'Dark root blended into ash blonde balayage, long wavy hair',
      ),
      borrowed(
        'images/work-1.jpg',
        'Icy platinum balayage on long, loose waves',
        'Icy platinum balayage, long wavy hair',
      ),
      borrowed(
        'images/work-5.jpg',
        'Creamy blonde highlights on long waves, seen from the back',
        'Creamy blonde highlights, long wavy hair',
      ),
      borrowed(
        'images/work-3.jpg',
        'Ash blonde balayage with curtain bangs',
        'Ash blonde balayage with curtain bangs, long hair',
      ),
      borrowed(
        'images/work-4.jpg',
        'Bronde waves blended from root to ends, seen from the back',
        'Bronde balayage, long wavy hair',
      ),
    ],
    reviews: BROOKE_REVIEWS,
  },
  {
    id: 'marcus',
    name: 'Marcus Bell',
    studio: 'Bell & Blade Barbers',
    city: 'Provo',
    photo: null,
    bio: 'Skin fades, tapers, and beards shaped to your face. Quiet shop, no rush. Kids welcome.',
    story:
      'I started cutting hair in my garage at 19 and now have a small shop on Center Street. I like a clean fade, an even beard, and a chair where you can just sit for half an hour. Bring the kids; I cut a lot of them.',
    yearsDoingHair: 9,
    specialties: ['Skin fades', 'Tapers', 'Beard shaping'],
    areas: ['mens'],
    location: { address: '75 W Center St, Provo, UT', lat: 40.2342, lng: -111.6624 },
    workDays: [2, 3, 4, 5, 6],
    prices: { 'mens-haircut': 35, 'beard-trim': 20, 'kids-cut': 25 },
    portfolio: [
      standIn('images/placeholder-mens-1.jpg', 'Skin fade, short straight hair'),
      standIn('images/placeholder-mens-2.jpg', 'Taper with a textured top, short wavy hair'),
      standIn('images/placeholder-mens-3.jpg', 'Scissor cut and side part, medium straight hair'),
      standIn('images/placeholder-beard-1.jpg', 'Beard shaping and lineup, full beard'),
      standIn('images/placeholder-kids-1.jpg', 'Kids’ cut, short straight hair'),
      standIn('images/placeholder-mens-4.jpg', 'Textured crop, short curly hair'),
    ],
    reviews: MARCUS_REVIEWS,
  },
  {
    id: 'diego',
    name: 'Diego Ramirez',
    studio: 'Corner Chair Barbershop',
    city: 'American Fork',
    photo: null,
    bio: 'Classic scissor cuts, clean beard trims, and first haircuts for kids who would rather not sit still.',
    story:
      'My grandfather ran a barbershop and I learned to cut with scissors before clippers. I like a classic cut that looks good for weeks, a beard trim that takes ten minutes, and making a kid’s first haircut a good memory.',
    yearsDoingHair: 6,
    specialties: ['Classic scissor cuts', 'Beard trims', 'Kids’ first haircuts'],
    areas: ['mens'],
    location: { address: '122 E Main St, American Fork, UT', lat: 40.3769, lng: -111.7958 },
    workDays: [1, 2, 3, 4, 5],
    prices: { 'mens-haircut': 30, 'beard-trim': 18, 'kids-cut': 22 },
    portfolio: [
      standIn('images/placeholder-mens-3.jpg', 'Classic side part, medium wavy hair'),
      standIn('images/placeholder-mens-4.jpg', 'Scissor-cut taper, short thick hair'),
      standIn('images/placeholder-beard-2.jpg', 'Beard trim and neck cleanup, medium beard'),
      standIn('images/placeholder-kids-2.jpg', 'Kids’ first haircut, short fine hair'),
      standIn('images/placeholder-mens-2.jpg', 'Skin fade, short straight hair'),
      standIn('images/placeholder-mens-1.jpg', 'Textured scissor cut, medium straight hair'),
    ],
    reviews: DIEGO_REVIEWS,
  },
];
