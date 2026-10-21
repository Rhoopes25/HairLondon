import { describe, expect, it } from 'vitest';
import { STYLISTS } from '../../data/seed/stylists';
import { editDistance, searchStylistsByText } from './text-search';

const ids = (query: string) =>
  searchStylistsByText(STYLISTS, query).matches.map((match) => match.stylist.id);

describe('editDistance', () => {
  it('counts edits, and a swap of neighbouring letters as one', () => {
    expect(editDistance('london', 'london')).toBe(0);
    expect(editDistance('londn', 'london')).toBe(1);
    expect(editDistance('lodnon', 'london')).toBe(1);
    expect(editDistance('', 'abc')).toBe(3);
  });
});

describe('searchStylistsByText', () => {
  it('returns everyone, in order, for an empty search', () => {
    expect(ids('  ')).toEqual(STYLISTS.map((stylist) => stylist.id));
  });

  it('finds by name, studio, city, or specialty, and by the start of a word', () => {
    expect(ids('London')).toContain('london');
    expect(ids('juniper')).toEqual(['sadie']);
    expect(ids('Lehi')).toEqual(['kai']);
    expect(ids('bobs')).toEqual(['kai']);
    expect(ids('lon')[0]).toBe('london');
  });

  it('still finds her with a typo, and says what we think she meant', () => {
    expect(ids('londn')[0]).toBe('london');
    expect(ids('sady')[0]).toBe('sadie');
    expect(ids('springvile')).toEqual(['brooke']);
    expect(searchStylistsByText(STYLISTS, 'londn').didYouMean).toBe('london');
  });

  it('does not stretch a short word into a match, and finds no one for nonsense', () => {
    expect(ids('zz')).toEqual([]);
    expect(ids('qwertyuiop')).toEqual([]);
  });

  it('needs every word to match', () => {
    expect(ids('sadie orem')).toEqual(['sadie']);
    expect(ids('sadie lehi')).toEqual([]);
  });

  it('ignores case and accents', () => {
    expect(ids('SADÍE')[0]).toBe('sadie');
  });
});
