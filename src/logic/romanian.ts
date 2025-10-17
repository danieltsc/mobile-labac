const diacriticsRegex = /[\u0300-\u036f]/g;

const replacements: Record<string, string> = {
  ă: 'a',
  â: 'a',
  î: 'i',
  ș: 's',
  Ț: 'T',
  ț: 't',
  Ș: 'S',
  Ă: 'A',
  Â: 'A',
  Î: 'I'
};

const replacementRegex = new RegExp(Object.keys(replacements).join('|'), 'g');

export const normalizeDiacritics = (value: string): string =>
  value
    .normalize('NFD')
    .replace(diacriticsRegex, '')
    .replace(replacementRegex, (match) => replacements[match] ?? match)
    .toLowerCase()
    .trim();

export const equalsNormalized = (a: string, b: string): boolean =>
  normalizeDiacritics(a) === normalizeDiacritics(b);
