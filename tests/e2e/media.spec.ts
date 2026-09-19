import { expect, test } from '@playwright/test';
import { mockMediaApi } from './fixtures/mediaApi';
import { mockScriptureApi } from './fixtures/scriptureApi';

test.beforeEach(async ({ page }) => {
  await mockScriptureApi(page);
  await mockMediaApi(page);
});

test('home page surfaces a premium media highlight below Project 52', async ({ page }) => {
  const mediaRequests: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/v1/audio-visual/')) {
      mediaRequests.push(`${url.pathname}${url.search}`);
    }
  });

  await page.goto('/');

  const mediaSection = page.locator('#latest-media');
  await expect(mediaSection.getByText('Latest From Media')).toBeVisible();
  await expect(mediaSection.getByRole('heading', { name: 'Stay nourished beyond Sunday.' })).toBeVisible();
  await expect(mediaSection.getByRole('heading', { name: 'Dying Well' })).toBeVisible();
  await expect(mediaSection.getByText('Rooted in Scripture.')).toHaveCount(0);
  await expect(mediaSection.getByText('Curated by A.N.T Media Crew')).toHaveCount(0);
  await expect(mediaSection.getByText('Sunday Service II English').first()).toBeVisible();
  await expect(mediaSection.getByText('My Final Instructions').first()).toBeVisible();
  await expect(mediaSection.getByText('Mercy Masika Wastahili Cover').first()).toBeVisible();

  await mediaSection.getByRole('link', { name: /Explore Library/i }).click();
  await expect(page).toHaveURL(/\/media$/);
  expect(mediaRequests).toEqual(expect.arrayContaining([
    '/v1/audio-visual/live/',
    '/v1/audio-visual/latest-sermon/',
    '/v1/audio-visual/featured/',
    '/v1/audio-visual/?type=livestream&ordering=latest&page_size=1',
    '/v1/audio-visual/?type=sermon&featured=true&ordering=latest&page_size=3',
    '/v1/audio-visual/?type=music&music_subcategory=pnw&ordering=latest&page_size=1',
  ]));
});

test('media landing page consumes curated media endpoints and renders core sections', async ({ page }) => {
  const mediaRequests: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/v1/audio-visual/')) {
      mediaRequests.push(`${url.pathname}${url.search}`);
    }
  });

  await page.goto('/media');

  await expect(page.getByRole('heading', { name: /Exalting Christ/i })).toBeVisible();
  await expect(page.locator('span', { hasText: /^Latest sermon$/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dying Well' }).first()).toBeVisible();
  await expect(page.getByText('Featured Sermon')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Teachings' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Latest Sermons' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Music' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Livestreams' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Shorts & Highlights' })).toBeVisible();
  await expect(page.getByText(/^Message \d+$/i)).toHaveCount(0);

  expect(mediaRequests).toEqual(expect.arrayContaining([
    '/v1/audio-visual/home/',
    '/v1/audio-visual/rails/',
    '/v1/audio-visual/live/',
    '/v1/audio-visual/latest-sermon/',
    '/v1/audio-visual/featured/',
    '/v1/audio-visual/?type=sermon&ordering=latest',
    '/v1/audio-visual/?type=music&ordering=latest',
    '/v1/audio-visual/?type=teaching&ordering=latest',
    '/v1/audio-visual/?type=livestream&ordering=latest',
    '/v1/audio-visual/?type=short&ordering=latest',
    '/v1/audio-visual/?type=other&ordering=latest',
    '/v1/audio-visual/series/',
  ]));
});

test('media tabs show filtered content, series detail, explore tab, and load more requests', async ({ page }) => {
  const pagedRequests: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname === '/v1/audio-visual/' && url.searchParams.has('page')) {
      pagedRequests.push(`${url.pathname}${url.search}`);
    }
  });

  await page.goto('/media');

  await page.getByRole('button', { name: /Teachings/i }).click();
  await expect(page.getByRole('heading', { name: 'Teachings' })).toBeVisible();
  await expect(page.getByText('Learning to Trust God in Every Season')).toBeVisible();

  await page.getByRole('button', { name: /Music/i }).click();
  const musicSubcategories = page.getByRole('navigation', { name: 'Music subcategories' });
  await expect(page.getByRole('heading', { name: 'Music' })).toBeVisible();
  await expect(page.getByText('Nipiga Makasia')).toBeVisible();
  await expect(page.getByText('Mercy Masika Wastahili Cover')).toBeVisible();
  await musicSubcategories.getByRole('button', { name: /^Music Choir$/i }).click();
  await expect(page.getByRole('heading', { name: 'Choir' })).toBeVisible();
  await expect(page.getByText('Nipiga Makasia')).toBeVisible();
  await expect(page.getByText('Mercy Masika Wastahili Cover')).toHaveCount(0);
  await page.getByRole('button', { name: /Load more/i }).click();
  await expect.poll(() => pagedRequests.some((url) => url.includes('type=music') && url.includes('music_subcategory=choir') && url.includes('page=2'))).toBe(true);
  await expect(page.getByText('Kanji Mbugua Mfalme Mkuu Cover')).toBeVisible();
  await musicSubcategories.getByRole('button', { name: /Music Praise and Worship/i }).click();
  await expect(page.getByRole('heading', { name: 'Praise and Worship' })).toBeVisible();
  await expect(page.getByText('Mercy Masika Wastahili Cover')).toBeVisible();
  await musicSubcategories.getByRole('button', { name: /^Music Explore$/i }).click();
  await expect(page.getByRole('heading', { name: 'Explore Music' })).toBeVisible();
  await expect(page.getByText('A.I.C Njoro Town Music Moment')).toBeVisible();

  await page.getByRole('button', { name: /Livestreams/i }).click();
  await expect(page.getByRole('heading', { name: 'Livestreams' })).toBeVisible();
  await expect(page.getByText('Sunday Service II English')).toBeVisible();
  await expect(page.getByText('Nipiga Makasia')).toHaveCount(0);

  await page.getByRole('button', { name: /Sermons/i }).click();
  await expect(page.getByRole('heading', { name: 'Sermons' })).toBeVisible();
  await page.getByRole('button', { name: /Load more/i }).click();
  await expect.poll(() => pagedRequests.some((url) => url.includes('type=sermon') && url.includes('page=2'))).toBe(true);

  await page.getByRole('button', { name: /Series/i }).click();
  await page.locator('a[href="/media/series/dying-well"]').first().click();
  await expect(page).toHaveURL(/\/media\/series\/dying-well$/);
  await expect(page.getByRole('heading', { name: 'Dying Well' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Messages in this series' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Watch Purpose Proceeds without permission' })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Watch Purpose Proceeds without permission' }).first()).toContainText('Message 1');
  await expect(page.getByRole('link', { name: 'Watch Dying Well' })).toHaveCount(0);
  await page.getByRole('button', { name: /Load more/i }).click();
  await expect(page.getByRole('link', { name: 'Watch Dying Well' })).toContainText('Message 2');
  await expect.poll(() => pagedRequests.some((url) => url.includes('series=dying-well') && url.includes('page=2'))).toBe(true);

  await page.reload();
  await expect(page).toHaveURL(/\/media\/series\/dying-well$/);
  await expect(page.getByRole('heading', { name: 'Messages in this series' })).toBeVisible();

  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: /Explore/i }).click();
  await expect(page.getByRole('heading', { name: 'Explore Media' })).toBeVisible();
  await expect(page.getByText('Church Family Update')).toBeVisible();
});

test('series detail remains readable, keyboard operable, themed, and overflow-free', async ({ page }, testInfo) => {
  for (const viewport of [
    { height: 900, label: 'mobile-320', width: 320 },
    { height: 900, label: 'mobile-375', width: 375 },
    { height: 1024, label: 'tablet', width: 768 },
    { height: 1100, label: 'desktop', width: 1440 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/media/series/dying-well');

    await expect(page.getByRole('heading', { name: 'Dying Well' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Messages in this series' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Watch Purpose Proceeds without permission' })).toHaveCount(2);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

    const messageGrid = page.locator('section[aria-labelledby="series-messages-heading"] > section > div.grid').first();
    const columnCount = await messageGrid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columnCount).toBe(viewport.width >= 1280 ? 4 : viewport.width >= 640 ? 2 : 1);

    await testInfo.attach(`series-${viewport.label}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  }

  const featuredMessage = page.getByRole('link', { name: 'Watch Purpose Proceeds without permission' }).first();
  await expect(featuredMessage.locator('a, button')).toHaveCount(0);
  await featuredMessage.focus();
  await expect(featuredMessage).toBeFocused();

  const themeToggle = page.getByRole('button', { name: 'Switch to dark theme' });
  await themeToggle.click();
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await featuredMessage.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/media\/watch\/purpose-proceeds-without-permission$/);
});

test('media watch page plays selected content, previews scripture, and preserves return navigation', async ({ page }) => {
  await page.goto('/media');
  await page.locator('a[href="/media/watch/dying-well"]').first().click();

  await expect(page).toHaveURL(/\/media\/watch\/dying-well$/);
  await expect(page.getByRole('heading', { name: 'Dying Well' })).toBeVisible();
  await expect(page.getByText('Now Playing')).toBeVisible();
  await expect(page.getByText('Rev. Harun Njuguna')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Referenced Scriptures' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible();
  await expect(page.getByText('Early on the first day of the week Mary Magdalene went to the tomb.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Related' })).toBeVisible();

  await page.getByRole('link', { name: /Open in Scripture/i }).click();
  await expect(page).toHaveURL(/\/scripture\?book=john&chapter=20&returnTo=%2Fmedia%2Fwatch%2Fdying-well/);
  await expect(page.getByRole('link', { name: /Back to message/i })).toBeVisible();

  await page.getByRole('link', { name: /Back to message/i }).click();
  await expect(page).toHaveURL(/\/media\/watch\/dying-well$/);
});

test('mobile media collections dock opens tabs and renders explore content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/media');

  await page.getByRole('button', { name: /Collections/i }).click();
  const collections = page.getByRole('dialog', { name: 'Media collections' });

  await expect(collections).toBeVisible();
  await collections.getByRole('button', { name: /Music/i }).click();
  await expect(collections.getByRole('button', { name: /^Music Choir$/i })).toBeVisible();
  await collections.getByRole('button', { name: /^Music Choir$/i }).click();
  await expect(page.getByText('Nipiga Makasia')).toBeVisible();

  await page.getByRole('button', { name: /Collections/i }).click();
  await page.getByRole('dialog', { name: 'Media collections' }).getByRole('button', { name: 'Explore', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Explore Media' })).toBeVisible();
  await expect(page.getByText('Church Family Update')).toBeVisible();

  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: /Collections/i })).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.getByRole('button', { name: /Collections/i })).toBeVisible();
});
