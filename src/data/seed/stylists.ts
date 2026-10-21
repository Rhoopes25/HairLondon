import type { Stylist } from '../../domain/models/stylist';

/**
 * Sample stylists. To add one, copy an entry, give it a unique id, and fill in the details.
 * Photo paths are relative to the app's public folder; the app resolves them against the base URL.
 * Days of the week use JavaScript numbering: 0 = Sunday ... 6 = Saturday.
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
    location: { address: '184 N University Ave, Provo, UT', lat: 40.2361, lng: -111.6585 },
    workDays: [2, 3, 4, 5, 6],
    prices: {
      haircut: 65,
      color: 120,
      highlights: 150,
      blowout: 45,
      'root-touch-up': 80,
      'deep-conditioning': 35,
    },
    portfolio: [
      { src: 'images/work-2.jpg', alt: 'Glossy jet black hair in long, soft layers' },
      { src: 'images/work-1.jpg', alt: 'Icy platinum balayage on long, loose waves' },
      {
        src: 'images/work-4.jpg',
        alt: 'Bronde waves blended from root to ends, seen from the back',
      },
      { src: 'images/work-6.jpg', alt: 'Soft golden brown hair with long face-framing layers' },
      { src: 'images/work-3.jpg', alt: 'Ash blonde balayage with curtain bangs' },
      {
        src: 'images/work-5.jpg',
        alt: 'Creamy blonde highlights on long waves, seen from the back',
      },
    ],
    reviews: [
      {
        id: 'london-1',
        name: 'Maren T.',
        stars: 5,
        text: 'Finally found someone I trust with my hair. Booked during nap time and it took two minutes.',
      },
      {
        id: 'london-2',
        name: 'Priya S.',
        stars: 5,
        text: 'Exactly what I asked for, first try. Easy to book around my schedule too.',
      },
      {
        id: 'london-3',
        name: 'Elise K.',
        stars: 4,
        text: 'Relaxed, no pressure, and my color has never looked better.',
      },
    ],
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
    location: { address: '620 S State St, Orem, UT', lat: 40.2881, lng: -111.6946 },
    workDays: [1, 3, 4, 5, 6],
    prices: { haircut: 55, color: 110, highlights: 165, 'root-touch-up': 75, blowout: 40 },
    portfolio: [
      {
        src: 'images/sadie-1.jpg',
        alt: 'Deep brunette with soft caramel highlights, curled into loose waves',
      },
      {
        src: 'images/sadie-2.jpg',
        alt: 'Long lavender waves with a soft, deeper root',
      },
    ],
    reviews: [
      {
        id: 'sadie-1',
        name: 'Hannah W.',
        stars: 5,
        text: 'She matched my old color perfectly and explained everything she was doing.',
      },
      {
        id: 'sadie-2',
        name: 'Jess P.',
        stars: 5,
        text: 'Evening appointments saved me. In and out before bedtime.',
      },
    ],
  },
  {
    id: 'kai',
    name: 'Kai Nakamura',
    studio: 'The Loft Salon',
    city: 'Lehi',
    photo: null,
    bio: 'Short cuts, bobs, and shapes that are easy to style at home in five minutes.',
    story:
      'I keep things simple: a cut you can style in five minutes with what you already own. Most of my clients are in and out in under an hour, and I’ll show you how to do it yourself at home.',
    yearsDoingHair: 4,
    specialties: ['Short cuts', 'Bobs', 'Quick visits'],
    location: { address: '350 W Main St, Lehi, UT', lat: 40.3916, lng: -111.8566 },
    workDays: [1, 2, 3, 4, 5],
    prices: { haircut: 45, color: 95, blowout: 35, 'deep-conditioning': 30 },
    portfolio: [
      {
        src: 'images/kai-1.jpg',
        alt: 'Straight, blunt-cut blonde lob, seen from the back',
      },
      {
        src: 'images/kai-2.jpg',
        alt: 'Copper and brunette bob with a hidden blonde underlayer',
      },
    ],
    reviews: [
      {
        id: 'kai-1',
        name: 'Aubrey L.',
        stars: 5,
        text: 'Best bob I have ever had. Grows out without looking messy.',
      },
      { id: 'kai-2', name: 'Nina R.', stars: 4, text: 'Quick, friendly, and really listened.' },
    ],
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
      {
        src: 'images/brooke-1.jpg',
        alt: 'Long caramel and honey highlights with soft curled ends, seen from the back',
      },
      {
        src: 'images/brooke-2.jpg',
        alt: 'Dark root melting into ash blonde balayage on loose waves',
      },
    ],
    reviews: [
      {
        id: 'brooke-1',
        name: 'Claire M.',
        stars: 5,
        text: 'Went four months between appointments and it still looked intentional.',
      },
      {
        id: 'brooke-2',
        name: 'Tess H.',
        stars: 5,
        text: 'Calm salon, great music, and she never rushed me.',
      },
    ],
  },
];
