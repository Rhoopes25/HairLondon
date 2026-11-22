/** 8 -> "8 years doing hair", 1 -> "1 year doing hair" */
export function formatExperience(years: number): string {
  return `${years} ${years === 1 ? 'year' : 'years'} doing hair`;
}
