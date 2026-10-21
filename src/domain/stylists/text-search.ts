import type { Stylist } from '../models/stylist';

/**
 * Finds stylists by what she types: a name, a studio, a city, or a specialty. Close-enough spelling
 * counts ("londn", "sady", "springvile"), because a typo should never look like "nobody here".
 */
export interface TextMatch {
  readonly stylist: Stylist;
  /** Lower is closer. 0 means every word she typed appears as typed. */
  readonly distance: number;
}

export interface TextSearchResult {
  readonly matches: readonly TextMatch[];
  /** The word we think she meant, when what she typed was a misspelling of it. */
  readonly didYouMean: string | null;
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');

const words = (text: string) => normalize(text).split(/\s+/).filter(Boolean);

/** Optimal string alignment distance: edits, plus swapping two neighbouring letters ("lodnon"). */
export function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  const at = (i: number, j: number) => d[i]?.[j] ?? Number.POSITIVE_INFINITY;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, at(i - 2, j - 2) + 1);
      }
      const row = d[i];
      if (row) row[j] = best;
    }
  }
  return at(a.length, b.length);
}

/** How many typos a word of this length may have and still count. Short words must be close. */
function allowedEdits(length: number): number {
  if (length <= 2) return 0;
  if (length <= 5) return 1;
  return 2;
}

/**
 * How far one typed word is from a word on her card. Typing the start of a word counts as exact
 * ("lon" finds London); otherwise compare against the word, or its start when she typed less.
 */
function wordDistance(typed: string, target: string): number {
  if (target.startsWith(typed)) return 0;
  const whole = editDistance(typed, target);
  const prefix =
    target.length > typed.length ? editDistance(typed, target.slice(0, typed.length)) : whole;
  // A partial-word typo is weaker evidence than a whole-word one, so it costs a little extra.
  return Math.min(whole, prefix + 0.5);
}

function searchableWords(stylist: Stylist): string[] {
  return words([stylist.name, stylist.studio, stylist.city, ...stylist.specialties].join(' '));
}

export function searchStylistsByText(
  stylists: readonly Stylist[],
  query: string,
): TextSearchResult {
  const typed = words(query);
  if (!typed.length) {
    return { matches: stylists.map((stylist) => ({ stylist, distance: 0 })), didYouMean: null };
  }

  let suggestion: { word: string; distance: number } | null = null;
  const matches: TextMatch[] = [];

  stylists.forEach((stylist) => {
    const targets = searchableWords(stylist);
    let total = 0;
    for (const word of typed) {
      let best = Number.POSITIVE_INFINITY;
      let bestTarget = '';
      for (const target of targets) {
        const distance = wordDistance(word, target);
        if (distance < best) {
          best = distance;
          bestTarget = target;
        }
      }
      // The half point lets a typo in the start of a longer word through ("sady" for Sadie).
      if (best > allowedEdits(word.length) + 0.5) return;
      total += best;
      if (best > 0 && (!suggestion || best < suggestion.distance)) {
        suggestion = { word: bestTarget, distance: best };
      }
    }
    matches.push({ stylist, distance: total });
  });

  matches.sort((a, b) => a.distance - b.distance);
  const exact = matches.some((match) => match.distance === 0);
  const meant = suggestion as { word: string; distance: number } | null;
  return {
    matches,
    didYouMean: !exact && meant ? meant.word : null,
  };
}
