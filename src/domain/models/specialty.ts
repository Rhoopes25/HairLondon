/**
 * What a stylist is known for, in a handful of groups that are worth filtering by. Her own
 * `specialties` lines ("Lived-in blonde", "Skin fades") say it in her words; these are the same
 * idea sorted into groups so the Stylists page can offer a short, readable filter.
 */
export const SPECIALTY_AREAS = ['blonde', 'color', 'cuts', 'mens'] as const;

export type SpecialtyArea = (typeof SPECIALTY_AREAS)[number];

export const SPECIALTY_LABELS: Readonly<Record<SpecialtyArea, string>> = {
  blonde: 'Blonde & highlights',
  color: 'Color & gray coverage',
  cuts: 'Short cuts & bobs',
  mens: 'Men’s cuts & beards',
};

export function isSpecialtyArea(value: unknown): value is SpecialtyArea {
  return typeof value === 'string' && (SPECIALTY_AREAS as readonly string[]).includes(value);
}
