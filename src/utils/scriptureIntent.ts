import type { BibleBook, BibleChapter, ScriptureReferenceIntent } from '../types/scripture';
import { normalizeReferenceValue } from './scriptureReference';

const scriptureApiBookMap: Record<string, string> = {
  genesis: 'Gen',
  exodus: 'Exod',
  leviticus: 'Lev',
  numbers: 'Num',
  deuteronomy: 'Deut',
  joshua: 'Josh',
  judges: 'Judg',
  ruth: 'Ruth',
  '1samuel': '1Sam',
  '2samuel': '2Sam',
  '1kings': '1Kgs',
  '2kings': '2Kgs',
  '1chronicles': '1Chr',
  '2chronicles': '2Chr',
  ezra: 'Ezra',
  nehemiah: 'Neh',
  esther: 'Esth',
  job: 'Job',
  psalm: 'Ps',
  psalms: 'Ps',
  proverbs: 'Prov',
  ecclesiastes: 'Eccl',
  songofsolomon: 'Song',
  isaiah: 'Isa',
  jeremiah: 'Jer',
  lamentations: 'Lam',
  ezekiel: 'Ezek',
  daniel: 'Dan',
  hosea: 'Hos',
  joel: 'Joel',
  amos: 'Amos',
  obadiah: 'Obad',
  jonah: 'Jonah',
  micah: 'Mic',
  nahum: 'Nah',
  habakkuk: 'Hab',
  zephaniah: 'Zeph',
  haggai: 'Hag',
  zechariah: 'Zech',
  malachi: 'Mal',
  matthew: 'Matt',
  mark: 'Mark',
  luke: 'Luke',
  john: 'John',
  acts: 'Acts',
  romans: 'Rom',
  '1corinthians': '1Cor',
  '2corinthians': '2Cor',
  galatians: 'Gal',
  ephesians: 'Eph',
  philippians: 'Phil',
  colossians: 'Col',
  '1thessalonians': '1Thess',
  '2thessalonians': '2Thess',
  '1timothy': '1Tim',
  '2timothy': '2Tim',
  titus: 'Titus',
  philemon: 'Phlm',
  hebrews: 'Heb',
  james: 'Jas',
  '1peter': '1Pet',
  '2peter': '2Pet',
  '1john': '1John',
  '2john': '2John',
  '3john': '3John',
  jude: 'Jude',
  revelation: 'Rev',
};

export const findBookIdForIntent = (
  books: BibleBook[],
  intent: ScriptureReferenceIntent | null,
) => {
  if (!intent) {
    return '';
  }

  const requested = normalizeReferenceValue(intent.book);
  const requestedBook = books.find(
    (book) =>
      normalizeReferenceValue(book.id) === requested ||
      normalizeReferenceValue(book.name) === requested ||
      normalizeReferenceValue(book.abbreviation || '') === requested,
  );

  return requestedBook?.id || '';
};

export const findChapterIdForIntent = (
  chapters: BibleChapter[],
  intent: ScriptureReferenceIntent | null,
) => {
  if (!intent) {
    return '';
  }

  const requestedChapter = chapters.find(
    (chapter) => chapter.number === intent.chapter,
  );

  return requestedChapter?.id || '';
};

export const resolveApiBookReference = (book: string) => {
  const normalized = normalizeReferenceValue(book);
  return scriptureApiBookMap[normalized] || book;
};
