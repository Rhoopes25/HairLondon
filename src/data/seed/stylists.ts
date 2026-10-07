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
    bio: 'Color specialist. Rich brunettes, glossy reds, and gray coverage that looks natural.',
    workDays: [1, 3, 4, 5, 6],
    prices: { haircut: 55, color: 110, highlights: 165, 'root-touch-up': 75, blowout: 40 },
    portfolio: [],
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
    workDays: [1, 2, 3, 4, 5],
    prices: { haircut: 45, color: 95, blowout: 35, 'deep-conditioning': 30 },
    portfolio: [],
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
    workDays: [3, 4, 5, 6],
    prices: {
      haircut: 60,
      color: 130,
      highlights: 175,
      'root-touch-up': 85,
      'deep-conditioning': 40,
    },
    portfolio: [],
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
