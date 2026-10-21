import type { GeoPoint } from '../../domain/stylists/location';

/**
 * Downtown Provo. Stands in for her location when she is farther than this from every stylist
 * (most testers are not in Utah County), so distances still mean something in the prototype.
 */
export const SAMPLE_LOCATION: GeoPoint & { readonly label: string } = {
  label: 'downtown Provo',
  lat: 40.2338,
  lng: -111.6585,
};

/** Farther than this from every stylist, and we use the sample location instead. */
export const NEARBY_MILES = 60;
