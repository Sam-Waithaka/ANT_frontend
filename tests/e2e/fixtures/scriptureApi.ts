import type { Page, Route } from '@playwright/test';

export const fixedDateIso = '2026-05-06T09:00:00+03:00';

export const versionsPayload = [
  {
    abbreviation: 'BSB',
    is_public: true,
    language: 'English',
    language_code: 'en',
    license_type: 'Public Domain',
    name: 'Berean Standard Bible',
    publication_year: 2020,
    source: 'Test Source',
  },
  {
    abbreviation: 'ASV',
    is_public: true,
    language: 'English',
    language_code: 'en',
    license_type: 'Public Domain',
    name: 'American Standard Version',
    publication_year: 1901,
    source: 'eBible',
  },
];

export const booksPayload = [
  { canonical_abbreviation: 'Gen', canonical_name: 'Genesis', osis_id: 'Gen', name: 'Genesis', testament: 'OT' },
  { canonical_abbreviation: '1Sam', canonical_name: '1 Samuel', osis_id: '1Sam', name: '1 Samuel', testament: 'OT' },
  { canonical_abbreviation: 'John', canonical_name: 'John', osis_id: 'John', name: 'John', testament: 'NT' },
  { canonical_abbreviation: 'Acts', canonical_name: 'Acts', osis_id: 'Acts', name: 'Acts', testament: 'NT' },
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
        if (!args.length) {
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

const comparisonPayloads: Record<string, { book: string | { name: string; osis_id: string }; chapter: number; results: Array<{ verse_number: number; readings: Array<{ display?: string; is_present?: boolean; version: string; text: string }> }> }> = {
  'Gen:1': {
    book: { name: 'Genesis', osis_id: 'Gen' },
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
          { version: 'ASV', is_present: false, display: 'Not present in this source', text: '' },
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

  await page.route('**/v1/bible/versions/**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname !== '/v1/bible/versions/') {
      await route.fallback();
      return;
    }

    await fulfillJson(route, versionsPayload);
  });
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

  await page.route('**/v1/bible/versions/*/annotations/**', async (route) => {
    const url = new URL(route.request().url());
    const book = url.searchParams.get('book');
    const chapter = url.searchParams.get('chapter');

    await fulfillJson(route, {
      count: book === 'Gen' && chapter === '1' ? 1 : 0,
      next: null,
      previous: null,
      results: book === 'Gen' && chapter === '1'
        ? [
            {
              annotation_type: 'footnote',
              content: 'Annotation footnote returned by the annotations endpoint.',
              end_offset: 16,
              raw_content: '<note caller="study">Raw annotation source text.</note>',
              source_marker: 'osis:note',
              start_offset: 16,
              verse_number: 1,
            },
            {
              annotation_type: 'cross_reference',
              anchor_text: 'beginning',
              content: 'Compare John 1:1 for the Word in the beginning.',
              end_offset: 16,
              source_marker: 'osis:xref',
              start_offset: 8,
              verse_number: 1,
            },
            {
              annotation_type: 'word_study',
              anchor_text: 'created',
              content: 'Created emphasizes divine initiative and purposeful action.',
              end_offset: 28,
              source_marker: 'osis:study',
              start_offset: 21,
              verse_number: 1,
            },
            {
              annotation_type: 'textual_variant',
              content: 'Some sources preserve a structural marker near this clause.',
              verse_number: 2,
            },
          ]
        : [],
    });
  });

  await page.route('**/v1/bible/versions/*/tokens/**', async (route) => {
    const url = new URL(route.request().url());
    const verse = url.searchParams.get('verse');

    await fulfillJson(route, {
      count: verse === '1' ? 2 : 0,
      next: null,
      previous: null,
      results: verse === '1'
        ? [
            { id: 'token-1', lemma: 'reshith', morph: 'N-fs', position: 1, strong: 'H7225', token: 'beginning' },
            { id: 'token-2', position: 2, token: 'God' },
          ]
        : [],
    });
  });

  await page.route('**/v1/bible/versions/*/sources/**', async (route) => {
    const url = new URL(route.request().url());
    const verse = url.searchParams.get('verse');

    await fulfillJson(route, {
      count: verse === '1' ? 1 : 0,
      next: null,
      previous: null,
      results: verse === '1'
        ? [
            {
              format: 'usfm',
              raw_text: '\\v 1 In the beginning God created the heavens and the earth.',
              source: 'Fixture USFM',
              verse_number: 1,
            },
          ]
        : [],
    });
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
    const pageNumber = Number(url.searchParams.get('page') || '1');
    const count = query === 'begoten' ? 26 : 2;
    const next = pageNumber === 1
      ? 'https://api.aicnjoro.org/v1/bible/search/?q=resurrection&version=BSB&page=2&page_size=25'
      : null;

    await fulfillJson(route, {
      count,
      next,
      previous: pageNumber > 1 ? 'https://api.aicnjoro.org/v1/bible/search/?q=resurrection&version=BSB&page=1&page_size=25' : null,
      results: pageNumber === 1
        ? [
            {
              book: { name: 'John', osis_id: 'John' },
              chapter: 20,
              credit: { source: 'Search Fixture' },
              exact_match: false,
              headline: `Search hit for <mark>${query}</mark>: Early on the first day of the week.`,
              rank: 1,
              reference: 'John 20:1',
              search_type: 'fuzzy',
              similarity: 0.82,
              text: `Search hit for ${query}: Early on the first day of the week.`,
              version: url.searchParams.get('version') || 'BSB',
              verse_number: 1,
            },
          ]
        : [
            {
              book: { name: 'John', osis_id: 'John' },
              chapter: 21,
              exact_match: true,
              headline: 'Another result for <mark>resurrection</mark> hope.',
              rank: 2,
              reference: 'John 21:1',
              search_type: 'full_text',
              text: 'Afterward Jesus appeared again to the disciples by the Sea of Tiberias.',
              version: url.searchParams.get('version') || 'BSB',
              verse_number: 1,
            },
          ],
      search_config: { page_size: Number(url.searchParams.get('page_size') || '0') },
      suggestions: ['resurrection hope'],
    });
  });

  await page.route('**/v1/bible/versions/*/resources/**', async (route) => fulfillJson(route, {
    count: 1,
    next: null,
    previous: null,
    results: [
      { title: 'BSB Preface', resource_type: 'preface', description: 'Translation background and usage notes.' },
    ],
  }));
  await page.route('**/v1/bible/versions/*/glossary/**', async (route) => {
    const url = new URL(route.request().url());
    const pageNumber = Number(url.searchParams.get('page') || '1');

    await fulfillJson(route, {
      count: 2,
      next: pageNumber === 1 ? 'https://api.aicnjoro.org/v1/bible/versions/BSB/glossary/?page=2&q=love' : null,
      previous: pageNumber > 1 ? 'https://api.aicnjoro.org/v1/bible/versions/BSB/glossary/?page=1&q=love' : null,
      results: pageNumber === 1
        ? [{ term: 'Love', definition: 'A covenantal commitment expressed in action.', language: 'English' }]
        : [{ term: 'Lovingkindness', definition: 'Steadfast covenant mercy.', language: 'English' }],
    });
  });
  await page.route('**/v1/bible/versions/*/markers/**', async (route) => fulfillJson(route, {
    count: 1,
    next: null,
    previous: null,
    results: [
      { status: 'omitted', reference: 'John 5:4', text: 'Verse marker note.' },
    ],
  }));
  await page.route('**/v1/bible/versions/*/notes/**', async (route) => fulfillJson(route, {
    count: 1,
    next: null,
    previous: null,
    results: [
      { note_type: 'footnote', reference: 'Genesis 1:1', text: 'A footnote returned by the notes endpoint.' },
    ],
  }));
};
