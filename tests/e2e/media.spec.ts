import { expect, test } from '@playwright/test';
import { mockMediaApi } from './fixtures/mediaApi';
import { mockScriptureApi } from './fixtures/scriptureApi';

test.beforeEach(async ({ page }) => {
  await mockScriptureApi(page);
  await mockMediaApi(page);
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
  await page.getByRole('button', { name: /Dying Well/i }).click();
  await expect(page.getByRole('heading', { name: 'Dying Well' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dying Well Messages' })).toBeVisible();
  await expect(page.getByText('Purpose Proceeds without permission')).toBeVisible();

  await page.getByRole('button', { name: /Explore/i }).click();
  await expect(page.getByRole('heading', { name: 'Explore Media' })).toBeVisible();
  await expect(page.getByText('Church Family Update')).toBeVisible();
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
  await expect(page.getByRole('heading', { name: 'Related Messages' })).toBeVisible();

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
