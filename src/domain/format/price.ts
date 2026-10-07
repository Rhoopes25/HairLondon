export function formatPrice(amount: number): string {
  return `$${amount}`;
}

/** "$45" when min equals max, otherwise "$35-45" with an en dash. */
export function formatPriceRange(min: number, max: number): string {
  return min === max ? formatPrice(min) : `$${min}–${max}`;
}
