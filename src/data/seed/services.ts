import { durationMin } from '../../domain/models/time';
import type { ServiceCatalog } from '../../domain/models/service';

/** Every service the site offers. Stylists choose which ones they do and set their own price. */
export const SERVICES: ServiceCatalog = {
  haircut: {
    id: 'haircut',
    name: 'Haircut',
    durationMin: durationMin(60),
    description: 'Wash, cut, and style. Bring a photo if you have one.',
  },
  color: {
    id: 'color',
    name: 'Color',
    durationMin: durationMin(120),
    description: 'All-over color, from a subtle refresh to a full change.',
  },
  highlights: {
    id: 'highlights',
    name: 'Highlights',
    durationMin: durationMin(150),
    description: 'Foiled or hand-painted brightness, blended to grow out soft.',
  },
  'root-touch-up': {
    id: 'root-touch-up',
    name: 'Root Touch-Up',
    durationMin: durationMin(90),
    description: 'Covers regrowth and grays so your color looks fresh again.',
  },
  blowout: {
    id: 'blowout',
    name: 'Blowout',
    durationMin: durationMin(45),
    description: 'Wash and a smooth, bouncy style that lasts a few days.',
  },
  'deep-conditioning': {
    id: 'deep-conditioning',
    name: 'Deep Conditioning',
    durationMin: durationMin(30),
    description: 'A moisture treatment for dry or color-tired hair.',
  },
};
