import { expect, test, type Page, type Route } from '@playwright/test';

const fixedDateIso = '2026-05-06T09:00:00+03:00';

const versionsPayload = [
  { abbreviation: 'BSB', name: 'Berean Standard Bible' },
  { abbreviation: 'ASV', name: 'American Standard Version' },
];

const booksPayload = [
  { osis_id: 'Gen', name: 'Genesis', testament: 'OT' },
  { osis_id: '1Sam', name: '1 Samuel', testament: 'OT' },
  { osis_id: 'John', name: 'John', testament: 'NT' },
];

const chapterList = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    number: index + 1,
    label: `Chapter ${index + 1}`,
  }));

const chapterPayloads: Record<string, Array<{ verse_number: number; text: string }>> = {
  'Gen:1': [
    { verse_number: 1, text: 'In the beginning God created the heavens and the earth.' },
    { verse_number: 2, text: 'Now the earth was formless and void.' },
  ],
  '1Sam:14': [
    { verse_number: 1, text: 'One day Jonathan son of Saul said to his young armor-bearer.' },
    { verse_number: 2, text: 'Meanwhile Saul was staying under the pomegranate tree.' },
  ],
  'John:20': [
    { verse_number: 1, text: 'Early on the first day of the week Mary Magdalene went to the tomb.' },
    { verse_number: 2, text: 'So she came running to Simon Peter and the other disciple.' },
  ],
};

const fulfillJson = async (route: Route, payload: unknown) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  });
};

const mockScriptureApi = async (page: Page) => {
  await page.addInitScript(({ iso }) => {
    const fixedTime = new Date(iso).getTime();
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
  }, { iso: fixedDateIso });

  await page.route('**/v1/bible/versions/', async (route) => {
    await fulfillJson(route, versionsPayload);
  });

  await page.route('**/v1/bible/versions/BSB/books/', async (route) => {
    await fulfillJson(route, booksPayload);
  });

  await page.route('**/v1/bible/versions/ASV/books/', async (route) => {
    await fulfillJson(route, booksPayload);
  });

  await page.route('**/v1/bible/versions/*/books/Gen/chapters/', async (route) => {
    await fulfillJson(route, chapterList(3));
  });

  await page.route('**/v1/bible/versions/*/books/1Sam/chapters/', async (route) => {
    await fulfillJson(route, chapterList(20));
  });

  await page.route('**/v1/bible/versions/*/books/John/chapters/', async (route) => {
    await fulfillJson(route, chapterList(21));
  });

  await page.route('**/v1/bible/versions/*/books/*/chapters/*/', async (route) => {
    const url = new URL(route.request().url());
    const match = url.pathname.match(/\/books\/([^/]+)\/chapters\/(\d+)\/$/);

    if (!match) {
      await route.fallback();
      return;
    }

    const [, book, chapter] = match;
    const payload = chapterPayloads[`${book}:${chapter}`] ?? [];
    await fulfillJson(route, payload);
  });
};

test.beforeEach(async ({ page }) => {
  await mockScriptureApi(page);
});

test('clicking the scripture Project 52 widget opens the OT reading directly', async ({ page }) => {
  await page.goto('/scripture');

  await expect(page.getByRole('heading', { name: 'Genesis 1' })).toBeVisible();
  await page.getByRole('button', { name: /1 Samuel 14-15/i }).click();

  await expect(page.getByRole('heading', { name: '1 Samuel 14' })).toBeVisible();
  await expect(page.getByText('One day Jonathan son of Saul said to his young armor-bearer.')).toBeVisible();
});

test('clicking a Project 52 tile opens the correct scripture route and chapter', async ({ page }) => {
  await page.goto('/project52');

  await page.getByRole('button', { name: /john 20/i }).click();

  await expect(page).toHaveURL(/\/scripture$/);
  await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible();
  await expect(page.getByText('Early on the first day of the week Mary Magdalene went to the tomb.')).toBeVisible();
});
