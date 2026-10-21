import type { StudioLocation } from '../models/stylist';

/** A point on the map, in degrees. Where she is, when she shares it. */
export interface GeoPoint {
  readonly lat: number;
  readonly lng: number;
}

const EARTH_RADIUS_MILES = 3958.8;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Straight-line distance in miles (haversine). Close enough to say "about 4 mi away". */
export function milesBetween(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

/** "0.4 mi away" under ten miles, whole miles beyond that. */
export function formatDistance(miles: number): string {
  const rounded = miles < 10 ? Math.round(miles * 10) / 10 : Math.round(miles);
  return `${rounded} mi away`;
}

/** A link that opens directions in Google Maps (which hands off to the maps app on a phone). */
export function directionsUrl(location: StudioLocation): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;
}

/** Nearest first. Stable for ties, so the list does not jump around. */
export function sortByDistance<T extends { location: StudioLocation }>(
  items: readonly T[],
  from: GeoPoint,
): T[] {
  return items
    .map((item, index) => ({ item, index, miles: milesBetween(from, item.location) }))
    .sort((a, b) => a.miles - b.miles || a.index - b.index)
    .map(({ item }) => item);
}

/** Miles to the closest of these places, or Infinity when there are none. */
export function nearestMiles(from: GeoPoint, places: readonly GeoPoint[]): number {
  return places.reduce((best, place) => Math.min(best, milesBetween(from, place)), Infinity);
}
