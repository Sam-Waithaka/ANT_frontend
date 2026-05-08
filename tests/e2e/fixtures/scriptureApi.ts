import type { Page, Route } from '@playwright/test';

export const fixedDateIso = '2026-05-06T09:00:00+03:00';

export const versionsPayload = [
  { abbreviation: 'BSB', name: 'Berean Standard Bible' },
  { abbreviation: 'ASV', name: 'American Standard Version' },
];

export const booksPayload = [
  { osis_id: 'Gen', name: 'Genesis', testament: 'OT' },
  { osis_id: '1Sam', name: '1 Samuel', testament: 'OT' },
  { osis_id: 'John', name: 'John', testament: 'NT' },
  { osis_id: 'Acts', name: 'Acts', testament: 'NT' },
];

export const fulfillJson = async (route: Route, payload: unknown, status = 200) => {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  });
};

export const installFixedDate = async (page: Page, iso = fixedDateIso) => {
  await page.addInitScript(({ fixedIso }) => {
    const fixedTime = new Date(fixedIso).getTime();
    const NativeDate = Date;

    class MockDate extends NativeDate {
      constructor(...args: ConstructorParameters<DateConstructor>) {
        if (args.length === 0) {
          super(fixedTime);
          return;
        }
        super(...args);
      }

      static now() {
        return fixedTime;
      }
    }

    // @ts-expect-error test override
    window.Date = MockDate;
  }, { fixedIso: iso });
};

const chapterList = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    number: index + 1,
    label: `Chapter ${index + 1}`,
  }));

const chapterPayloads: Record<string, unknown> = {
  'Gen:1': {
    verses: [
      {
        id: 'gen-1-1',
        verse_number: 1,
        text: 'In the beginning God created the heavens and the earth.',
        cross_references: [{ reference: 'John 1:1', text: 'The Word was in the beginning.' }],
        footnotes: [{ text: 'Genesis opens the biblical story.' }],
      },
      { id: 'gen-1-2', verse_number: 2, text: 'Now the earth was formless and void.' },
    ],
    credit: { license_notes: 'Public domain test scripture.' },
  },
  'Gen:2': [
    { id: 'gen-2-1', verse_number: 1, text: 'Thus the heavens and the earth were completed in all their vast array.' },
  ],
  '1Sam:14': [
    { id: '1sam-14-1', verse_number: 1, text: 'One day Jonathan son of Saul said to his young armor-bearer.' },
    { id: '1sam-14-2', verse_number: 2, text: 'Meanwhile Saul was staying under the pomegranate tree.' },
  ],
  'John:20': [
    { id: 'john-20-1', verse_number: 1, text: 'Early on the first day of the week Mary Magdalene went to the tomb.' },
    { id: 'john-20-2', verse_number: 2, text: 'So she came running to Simon Peter and the other disciple.' },
  ],
  'John:21': [
    { id: 'john-21-1', verse_number: 1, text: 'Afterward Jesus appeared again to the disciples by the Sea of Tiberias.' },
  ],
  'Acts:1': [
    { id: 'acts-1-1', verse_number: 1, text: 'In my first book, O Theophilus, I wrote about all that Jesus began to do and to teach.' },
  ],
};

const comparisonPayloads: Record<string, { book: string; chapter: number; results: Array<{ verse_number: number; readings: Array<{ version: string; text: string }> }> }> = {
  'Gen:1': {
    book: 'Genesis',
    chapter: 1,
    results: [
      {
        verse_number: 1,
        readings: [
          { version: 'BSB', text: 'In the beginning God created the heavens and the earth.' },
          { version: 'ASV', text: 'In the beginning God created the heavens and the earth.' },
        ],
      },
      {
        verse_number: 2,
        readings: [
          { version: 'BSB', text: 'Now the earth was formless and void.' },
          { version: 'ASV', text: 'And the earth was waste and void.' },
        ],
      },
    ],
  },
  'Gen:2': {
    book: 'Genesis',
    chapter: 2,
    results: [
      {
        verse_number: 1,
        readings: [
          { version: 'BSB', text: 'Thus the heavens and the earth were completed in all their vast array.' },
          { version: 'ASV', text: 'And the heavens and the earth were finished, and all the host of them.' },
        ],
      },
    ],
  },
};

export const mockScriptureApi = async (page: Page) => {
  await installFixedDate(page);

  await page.route('**/v1/bible/versions/', async (route) => fulfillJson(route, versionsPayload));
  await page.route('**/v1/bible/versions/*/books/', async (route) => fulfillJson(route, booksPayload));

  await page.route('**/v1/bible/versions/*/books/Gen/chapters/', async (route) => fulfillJson(route, chapterList(3)));
  await page.route('**/v1/bible/versions/*/books/1Sam/chapters/', async (route) => fulfillJson(route, chapterList(20)));
  await page.route('**/v1/bible/versions/*/books/John/chapters/', async (route) => fulfillJson(route, chapterList(21)));
  await page.route('**/v1/bible/versions/*/books/Acts/chapters/', async (route) => fulfillJson(route, chapterList(28)));

  await page.route('**/v1/bible/versions/*/books/*/chapters/*/', async (route) => {
    const url = new URL(route.request().url());
    const match = url.pathname.match(/\/books\/([^/]+)\/chapters\/(\d+)\/$/);

    if (!match) {
      await route.fallback();
      return;
    }

    const [, book, chapter] = match;
    await fulfillJson(route, chapterPayloads[`${book}:${chapter}`] ?? []);
  });

  await page.route('**/v1/bible/compare/**', async (route) => {
    const url = new URL(route.request().url());
    const book = url.searchParams.get('book') || '';
    const chapter = url.searchParams.get('chapter') || '';
    const payload = comparisonPayloads[`${book}:${chapter}`] ?? { book, chapter: Number(chapter), results: [] };

    await fulfillJson(route, payload);
  });

  await page.route('**/v1/bible/search/**', async (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('q') || '';

    await fulfillJson(route, [
      {
        reference: 'John 20:1',
        text: `Search hit for ${query}: Early on the first day of the week.`,
        version: 'BSB',
        testament: 'NT',
      },
    ]);
  });

  await page.route('**/v1/bible/versions/*/resources/**', async (route) => fulfillJson(route, [
    { title: 'BSB Preface', resource_type: 'preface', description: 'Translation background and usage notes.' },
  ]));
  await page.route('**/v1/bible/versions/*/glossary/**', async (route) => fulfillJson(route, [
    { term: 'Love', definition: 'A covenantal commitment expressed in action.', language: 'English' },
  ]));
  await page.route('**/v1/bible/versions/*/markers/**', async (route) => fulfillJson(route, [
    { status: 'omitted', reference: 'John 5:4', text: 'Verse marker note.' },
  ]));
  await page.route('**/v1/bible/versions/*/notes/**', async (route) => fulfillJson(route, [
    { note_type: 'footnote', reference: 'Genesis 1:1', text: 'A footnote returned by the notes endpoint.' },
  ]));
};
