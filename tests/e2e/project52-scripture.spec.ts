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
  { osis_id: 'Acts', name: 'Acts', testament: 'NT' },
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
  'John:21': [
    { verse_number: 1, text: 'Afterward Jesus appeared again to the disciples by the Sea of Tiberias.' },
  ],
  'Acts:1': [
    { verse_number: 1, text: 'In my first book, O Theophilus, I wrote about all that Jesus began to do and to teach.' },
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

  await page.route('**/v1/bible/versions/*/books/Acts/chapters/', async (route) => {
    await fulfillJson(route, chapterList(28));
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

  await page.route('**/v1/bible/compare/**', async (route) => {
    const url = new URL(route.request().url());
    const book = url.searchParams.get('book') || '';
    const chapter = url.searchParams.get('chapter') || '';
    const payload = comparisonPayloads[`${book}:${chapter}`] ?? { book, chapter: Number(chapter), results: [] };
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
  await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole('button', {
      name: /Early on the first day of the week Mary Magdalene went to the tomb\./i,
    }),
  ).toBeVisible({ timeout: 15000 });
});

test('mobile scripture dock panels close when tapping the backdrop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/scripture');

  await page.getByRole('button', { name: /project 52/i }).click();
  await expect(page.getByRole('dialog', { name: /project 52/i })).toBeVisible();

  await page.mouse.click(12, 12);
  await expect(page.getByRole('dialog', { name: /project 52/i })).toHaveCount(0);
});

test('mobile project 52 panel closes after opening a reading', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/scripture');

  await page.getByRole('button', { name: /project 52/i }).click();
  await expect(page.getByRole('dialog', { name: /project 52/i })).toBeVisible();

  await page.getByRole('button', { name: /john 20/i }).click();

  await expect(page.getByRole('dialog', { name: /project 52/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible();
  await expect(page.getByText('Early on the first day of the week Mary Magdalene went to the tomb.')).toBeVisible();
});

test('clicking a verse opens the scripture action sheet', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: /copy verse/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /compare verse/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /collapse scripture actions|expand scripture actions/i })).toBeVisible();
});

test('compare verse opens the chapter comparison modal focused on the selected verse', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /compare verse/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });

  await expect(comparisonDialog).toBeVisible();
  await expect(comparisonDialog.getByRole('heading', { name: 'Genesis 1', exact: true })).toBeVisible();
  await expect(comparisonDialog.getByText('Verse 1')).toBeVisible();
  await expect(
    comparisonDialog.getByRole('article').filter({
      has: page.getByText('In the beginning God created the heavens and the earth.', { exact: true }),
    }).first(),
  ).toBeVisible();
});

test('compare selection opens the chapter comparison modal with selected verses highlighted', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /Now the earth was formless and void\./i }).click();
  await page.getByRole('button', { name: /compare selection/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });

  await expect(comparisonDialog).toBeVisible();
  await expect(comparisonDialog.locator('[data-highlighted="true"][data-verse-number="1"]')).toBeVisible();
  await expect(comparisonDialog.locator('[data-highlighted="true"][data-verse-number="2"]')).toBeVisible();
});

test('compare chapter opens the chapter comparison modal without selected verse highlights', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /expand scripture actions/i }).click();
  await page.getByRole('button', { name: /compare chapter/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });

  await expect(comparisonDialog).toBeVisible();
  await expect(comparisonDialog.locator('[data-highlighted="true"]')).toHaveCount(0);
});

test('comparison modal version selector can deselect an active version', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /compare verse/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });

  await expect(comparisonDialog).toBeVisible();
  await comparisonDialog.getByRole('button', { name: /BSB, ASV/i }).click();
  await comparisonDialog.getByRole('checkbox', { name: /ASV/i }).uncheck();

  await expect(comparisonDialog.getByRole('button', { name: /^BSB$/i })).toBeVisible();
  await expect(comparisonDialog.locator('[data-comparison-version="ASV"]')).toHaveCount(0);
  await expect(comparisonDialog.getByRole('checkbox', { name: /ASV/i })).not.toBeChecked();
});

test('comparison modal chapter picker loads another chapter', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /compare verse/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });
  await expect(comparisonDialog).toBeVisible();

  await comparisonDialog.getByRole('button', { name: 'Comparison chapter' }).click();
  await comparisonDialog.getByRole('button', { name: '2', exact: true }).click();

  await expect(page.getByRole('dialog', { name: 'Genesis 2', exact: true })).toBeVisible();
  await expect(page.getByText('Thus the heavens and the earth were completed in all their vast array.')).toBeVisible();
});

test('comparison modal closes picker menus and the modal on outside clicks', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /compare verse/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });
  await expect(comparisonDialog).toBeVisible();

  await comparisonDialog.getByRole('button', { name: /BSB, ASV/i }).click();
  await expect(comparisonDialog.getByRole('checkbox', { name: /ASV/i })).toBeVisible();

  await comparisonDialog.getByRole('heading', { name: 'Genesis 1', exact: true }).click();
  await expect(comparisonDialog.getByRole('checkbox', { name: /ASV/i })).toHaveCount(0);

  await page.mouse.click(8, 8);
  await expect(comparisonDialog).toHaveCount(0);
});

test('shared verses link opens the chapter and selects the requested verses', async ({ page }) => {
  await page.goto('/scripture?book=John&chapter=20&verses=1-2&version=BSB');

  await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'John 20:1-2 (BSB)' })).toBeVisible();
  await expect(page.getByRole('button', { name: /copy selection/i })).toBeVisible();
});

test('previous chapter from the first chapter opens the previous book final chapter', async ({ page }) => {
  await page.goto('/scripture?book=Acts&chapter=1&version=BSB');

  await expect(page.getByRole('heading', { name: 'Acts 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Previous chapter' }).click();

  await expect(page.getByRole('heading', { name: 'John 21' })).toBeVisible();
  await expect(page.getByText('Afterward Jesus appeared again to the disciples by the Sea of Tiberias.')).toBeVisible();
});
