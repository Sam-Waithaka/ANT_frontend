import { expect, test } from '@playwright/test';
import { fulfillJson, mockScriptureApi } from './fixtures/scriptureApi';

test.beforeEach(async ({ page }) => {
  await mockScriptureApi(page);
});

test('landing page navigation, fallback route, and desktop settings theme toggle work', async ({ page }) => {
  await page.goto('/not-a-real-route');

  await expect(page.getByRole('heading', { name: /Welcome to\s+A\.I\.C\s+Njoro Town/i })).toBeVisible();
  await expect(page.getByRole('img', { name: /AIC Njoro Town church building/i })).toBeVisible();
  await expect(page.getByText('Growing together in faith, fellowship, and the Word.')).toBeVisible();
  await expect(page.getByText('Daily Verse')).toBeVisible();

  await page.getByRole('button', { name: /settings/i }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.getByRole('menuitem', { name: /dark theme/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.getByRole('link', { name: /^View Plan/i }).click();
  await expect(page).toHaveURL(/\/project52$/);
  await expect(page.getByRole('heading', { name: 'Project 52' })).toBeVisible();

  await page.getByRole('link', { name: 'Scripture' }).click();
  await expect(page).toHaveURL(/\/scripture$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Genesis 1' })).toBeVisible();
});

test('landing page sections expose responsive hero, verse, and Project 52 preview content', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: /join us this sunday/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /explore scripture/i })).toBeVisible();
  await expect(page.getByText('Ephesians 2:10 | BSB')).toBeVisible();
  await expect(page.getByText('For we are His workmanship')).toBeVisible();
  await expect(page.getByText('Week 18 of 52')).toBeVisible();
  await expect(page.getByText('35%')).toBeVisible();
  await expect(page.getByText('OT: 1 Samuel 7-9')).toBeVisible();
  await expect(page.getByText('NT: John 18')).toBeVisible();
  await expect(page.getByText('OT: 1 Samuel 18-19')).toBeVisible();
  await expect(page.getByText('NT: Acts 1')).toBeVisible();
  await expect(page.getByText('OT: 1 Samuel 10-13')).toHaveCount(0);
  await expect(page.getByText('OT: 1 Samuel 14-15')).toHaveCount(0);
  await expect(page.getByText('OT: 1 Samuel 16-17')).toHaveCount(0);
  await expect(page.getByText('Weekly ground covered')).toHaveCount(0);

  await page.getByRole('button', { name: /explore scripture/i }).click();
  await expect(page).toHaveURL(/\/scripture$/);
  await expect(page.getByRole('heading', { level: 1, name: 'John 20' })).toBeVisible();
  await page.goto('/');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
  await expect(page.getByRole('heading', { name: /Welcome to\s+A\.I\.C\s+Njoro Town/i })).toBeVisible();
});

test('mobile navigation drawer opens, changes routes, toggles theme, and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  const drawer = page.getByRole('dialog', { name: 'Navigation menu' });

  await expect(drawer).toBeVisible();
  await drawer.getByRole('button', { name: /dark theme/i }).click();
  await expect(drawer).toHaveCount(0);
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('dialog', { name: 'Navigation menu' }).getByRole('link', { name: 'Scripture' }).click();

  await expect(page).toHaveURL(/\/scripture$/);
  await expect(page.getByRole('heading', { name: 'Genesis 1' })).toBeVisible();
});

test('Project 52 search, testament filters, current-week jump, accordion, and no-results state work', async ({ page }) => {
  await page.goto('/project52');

  await expect(page.getByText('Week 18 of 52').first()).toBeVisible();
  await page.getByPlaceholder('Search by book').fill('John');

  await expect(page.getByRole('tab', { name: 'New Testament' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: /john 20/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /1 Samuel/i })).toHaveCount(0);

  await page.getByPlaceholder('Search by book').fill('zzzz');
  await expect(page.getByText('No readings match that search. Try a book name like John, Psalms, or Romans.')).toBeVisible();

  await page.getByPlaceholder('Search by book').fill('');
  await page.getByRole('tab', { name: 'Both' }).click();
  await page.getByRole('button', { name: /Current week Week 18/i }).click();
  await expect(page.getByRole('button', { name: /1 Samuel 14-15/i })).toHaveCount(0);

  await page.getByRole('button', { name: /today \/ current week/i }).click();
  await expect(page.getByRole('button', { name: /1 Samuel 14-15/i })).toBeVisible();
});

test('Project 52 PDF download control reports progress without leaving the page', async ({ page }) => {
  await page.goto('/project52');

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /download plan/i }).click();
  await expect(page.getByRole('status')).toContainText(/Creating Project 52 PDF|downloaded successfully/i);
  await download;
  await expect(page).toHaveURL(/\/project52$/);
});

test('Scripture reference controls change version, book, chapter, and next navigation', async ({ page }) => {
  await page.goto('/scripture');

  await expect(page.getByRole('heading', { level: 1, name: 'Genesis 1' })).toBeVisible();
  const readerControls = page.locator('div.pointer-events-auto').filter({
    has: page.getByRole('button', { name: 'Previous chapter' }),
  }).first();

  await readerControls.getByRole('button', { name: 'Genesis', exact: true }).click();
  await page.locator('div.absolute.bottom-full').getByRole('button', { name: 'John', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'John 1' })).toBeVisible();

  await readerControls.getByRole('button', { name: '1', exact: true }).click();
  await page.locator('div.absolute.bottom-full').getByRole('button', { name: '20', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'John 20' })).toBeVisible();

  await page.getByRole('button', { name: 'Next chapter' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'John 21' })).toBeVisible();

  await readerControls.getByRole('button', { name: /BSB/i }).click();
  await page.locator('div.absolute.bottom-full').getByRole('button', { name: /American Standard Version/i }).click();
  await expect(readerControls.getByRole('button', { name: /ASV/i })).toBeVisible();
});

test('Scripture search replaces the reading view with API results and clears back to the chapter', async ({ page }) => {
  await page.goto('/scripture');

  const searchInput = page.getByPlaceholder('Search Scripture...').first();
  const searchRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === '/v1/bible/search/' && url.searchParams.get('q') === 'resurrection';
  });
  await searchInput.fill('resurrection');
  const request = await searchRequest;
  const requestUrl = new URL(request.url());

  expect(requestUrl.searchParams.get('version')).toBe('BSB');
  expect(requestUrl.searchParams.get('page_size')).toBe('25');

  await expect(page.getByRole('heading', { name: 'Search Scripture' })).toBeVisible();
  await expect(page.getByText('Showing results for "resurrection"')).toBeVisible();
  await expect(page.getByText('2 results for "resurrection"')).toBeVisible();
  await expect(page.getByText('Showing close matches')).toBeVisible();
  await expect(page.getByText('Suggestions:')).toBeVisible();
  await expect(page.getByText('resurrection hope')).toBeVisible();
  await expect(page.getByText('John 20:1')).toBeVisible();
  await expect(page.getByText('Search hit for resurrection: Early on the first day of the week.')).toBeVisible();

  await page.getByRole('button', { name: 'Load more' }).click();
  await expect(page.getByText('John 21:1')).toBeVisible();
  await expect(page.getByText('Another result for resurrection hope.')).toBeVisible();

  await searchInput.fill('');
  await expect(page.getByRole('heading', { level: 1, name: 'Genesis 1' })).toBeVisible();

  await searchInput.fill('resurrection');
  await expect(page.getByRole('button', { name: 'John 20:1' })).toBeVisible();
  await page.getByRole('button', { name: 'John 20:1' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'John 20' })).toBeVisible();
});

test('Scripture action sheet copy actions show feedback and Escape closes the sheet', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created/i }).click();
  await page.getByRole('button', { name: /copy verse/i }).click();
  await expect(page.getByRole('status')).toHaveText('Verse copied.');

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain('Genesis 1:1');
  expect(clipboardText).toContain('Continue reading on A.I.C Njoro Town Church:');
  expect(clipboardText).toContain('/scripture?book=Gen&chapter=1&verses=1&version=BSB');

  await page.getByRole('button', { name: 'Close Scripture actions' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('desktop Bible tools load compare, glossary, resources, markers, and notes results', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: 'Run comparison' }).click();
  await expect(page.getByRole('dialog', { name: 'Genesis 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Close comparison' }).click();
  await expect(page.getByRole('dialog', { name: 'Genesis 1' })).toHaveCount(0);
  await expect(page.getByText('2 verses compared across 2 versions.')).toBeVisible();
  await page.getByRole('button', { name: 'View comparison' }).click();
  await expect(page.getByRole('dialog', { name: 'Genesis 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Close comparison' }).click();
  await expect(page.getByRole('dialog', { name: 'Genesis 1' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Glossary' }).click();
  await page.getByPlaceholder('Glossary term').fill('love');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByText('A covenantal commitment expressed in action.')).toBeVisible();

  await page.getByRole('button', { name: 'Resources' }).click();
  await page.getByRole('button', { name: 'Load resources' }).click();
  await expect(page.getByText('BSB Preface')).toBeVisible();

  await page.getByRole('button', { name: 'Markers' }).click();
  await page.getByRole('button', { name: 'Load markers' }).click();
  await expect(page.getByText('John 5:4')).toBeVisible();

  await page.getByRole('button', { name: 'Notes' }).click();
  await page.getByRole('button', { name: 'Load notes' }).click();
  await expect(page.getByText('A footnote returned by the notes endpoint.')).toBeVisible();
});

test('mobile Bible Tools panel supports embedded tools and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/scripture');

  await page.getByRole('button', { name: /Bible Tools/i }).click();
  const toolsPanel = page.getByRole('dialog', { name: /Bible Tools/i });

  await expect(toolsPanel).toBeVisible();
  await toolsPanel.getByRole('button', { name: 'Glossary' }).click();
  await toolsPanel.getByRole('button', { name: 'Run tool' }).click();
  await expect(toolsPanel.getByText('A covenantal commitment expressed in action.')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(toolsPanel).toHaveCount(0);
});

test('Scripture API errors render connection issue UI', async ({ page }) => {
  await page.route('**/v1/bible/versions/BSB/books/Gen/chapters/1/', async (route) => {
    await fulfillJson(route, { detail: 'Service unavailable' }, 503);
  });

  await page.goto('/scripture');

  await expect(page.getByText('Connection issue')).toBeVisible();
  await expect(page.getByRole('alert')).toBeVisible();
});
