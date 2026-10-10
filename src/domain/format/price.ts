export function formatPrice(amount: number): string {
  return `$${amount}`;
}

/** "$45" when min equals max, otherwise "$35-45" with an en dash. */
export function formatPriceRange(min: number, max: number): string {
  return min === max ? formatPrice(min) : `$${min}–${max}`;
}

/**
 * Prices are starting points (longer or thicker hair can cost more), so a price we quote always
 * carries a plus: "$65+". A price already confirmed with the stylist would use formatPrice.
 */
export function formatStartingPrice(amount: number): string {
  return `${formatPrice(amount)}+`;
}
