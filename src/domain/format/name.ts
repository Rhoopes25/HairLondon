/** "Sadie Morgan" -> "SM" */
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** "Sadie Morgan" -> "Sadie" */
export function firstName(name: string): string {
  return name.trim().split(' ')[0] ?? name;
}

/** "Maren Thompson" -> "Maren T."; a single name stays as it is. */
export function reviewerName(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const first = words[0] ?? '';
  const last = words.length > 1 ? words.at(-1) : undefined;
  return last ? `${first} ${last[0]?.toUpperCase() ?? ''}.` : first;
}
