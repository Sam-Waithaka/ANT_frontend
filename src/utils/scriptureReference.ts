const bookNames = [
  'Song of Solomon',
  '1 Thessalonians',
  '2 Thessalonians',
  '1 Corinthians',
  '2 Corinthians',
  '1 Chronicles',
  '2 Chronicles',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Timothy',
  '2 Timothy',
  '1 Peter',
  '2 Peter',
  '1 John',
  '2 John',
  '3 John',
  'Deuteronomy',
  'Ecclesiastes',
  'Lamentations',
  'Philippians',
  'Colossians',
  'Revelation',
  'Zephaniah',
  'Zechariah',
  'Matthew',
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Joshua',
  'Judges',
  'Psalms',
  'Psalm',
  'Proverbs',
  'Jeremiah',
  'Ezekiel',
  'Daniel',
  'Galatians',
  'Ephesians',
  'Hebrews',
  'Malachi',
  'Romans',
  'Esther',
  'Isaiah',
  'Hosea',
  'Habakkuk',
  'Nehemiah',
  'Philemon',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Ruth',
  'Ezra',
  'Job',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Haggai',
  'Titus',
  'James',
  'Jude',
].sort((left, right) => right.length - left.length);

export const parseReadingReference = (reading: string) => {
  const firstReading = reading.split(';')[0]?.trim() || reading.trim();
  const matchedBook = bookNames.find((bookName) => firstReading.toLowerCase().startsWith(bookName.toLowerCase()));

  if (!matchedBook) {
    return null;
  }

  const remainder = firstReading.slice(matchedBook.length).trim();
  const chapter = Number(remainder.match(/\d+/)?.[0] || 1);

  return {
    book: matchedBook === 'Psalm' ? 'Psalms' : matchedBook,
    chapter,
  };
};

export const buildScriptureHref = (reading: string) => {
  const reference = parseReadingReference(reading);

  if (!reference) {
    return '/scripture';
  }

  const params = new URLSearchParams({
    book: reference.book,
    chapter: String(reference.chapter),
  });

  return `/scripture?${params.toString()}`;
};

export const normalizeReferenceValue = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
