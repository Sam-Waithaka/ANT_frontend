import { expect, test } from '@playwright/test';

const publicDetail = {
  author_attributions: [],
  author_display: 'Pastor Jane',
  byline: 'Pastor Jane',
  canonical_lookup: {
    published_at: '2026-07-17T09:00:00Z',
    slug: 'grace-for-today',
  },
  canonical_url: '/resources/grace-for-today',
  categories: [
    {
      description: '',
      id: 2,
      is_active: true,
      is_featured: false,
      name: 'Prayer',
      parent: null,
      slug: 'prayer',
      sort_order: 1,
      writing_count: 3,
    },
  ],
  content_html: '<p>Cached HTML should not be used yet.</p>',
  content_json: {
    root: {
      children: [
        {
          children: [
            {
              text: 'Grace teaches us to walk faithfully.',
              type: 'text',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  },
  content_version: 1,
  excerpt: 'A public article excerpt.',
  id: 10,
  media_embeds: [],
  ministries: [],
  continue_reading: {
    more_from_categories: [],
    more_from_series: [],
    more_resources: [
      {
        author_attributions: [],
        author_display: 'A.I.C Njoro Town',
        byline: 'A.I.C Njoro Town',
        categories: [],
        excerpt: 'Keep reading in the library.',
        id: 20,
        ministries: [],
        og_image_detail: null,
        published_at: '2026-07-18T09:00:00Z',
        reading_time_minutes: 4,
        resource_type_detail: { id: 1, name: 'Devotional', slug: 'devotional' },
        scripture_references: [],
        seo_description: 'Another public resource.',
        seo_title: 'Another Resource',
        series: [],
        slug: 'another-resource',
        tags: [],
        title: 'Another Resource',
        writing_type: 'ARTICLE',
      },
    ],
    study_same_scriptures: [],
  },
  next_article: null,
  og_description: 'OG description.',
  og_image_detail: null,
  og_title: 'OG title',
  previous_article: null,
  published_at: '2026-07-17T09:00:00Z',
  reading_time_minutes: 6,
  resource_type_detail: { id: 1, name: 'Devotional', slug: 'devotional' },
  scripture_references: [
    {
      book: 'John',
      book_detail: {
        abbreviation: 'Jn',
        id: 43,
        name: 'John',
        number: 43,
        osis_id: 'John',
        testament: 'NT',
      },
      book_osis: 'John',
      chapter_start: 3,
      display_text: 'John 3:16',
      id: 99,
      verse_start: 16,
      version: 'BSB',
      writing: 10,
    },
    {
      book: 'Psalms',
      book_osis: 'Ps',
      chapter_start: 119,
      display_text: 'Psalms 119:9',
      id: 100,
      verse_start: 9,
      version: 'BSB',
      writing: 10,
    },
    {
      book: 'Genesis',
      book_osis: 'Gen',
      chapter_start: 1,
      display_text: 'GEN 1:1',
      id: 101,
      verse_start: 1,
      version: 'BSB',
      writing: 10,
    },
    {
      book: '2 Timothy',
      book_osis: '2Tim',
      chapter_start: 3,
      display_text: '2 Timothy 3:16',
      id: 102,
      verse_start: 16,
      version: 'BSB',
      writing: 10,
    },
  ],
  seo_description: 'SEO description.',
  seo_title: 'SEO title',
  series: [
    {
      cover_image_detail: null,
      description: '',
      id: 3,
      slug: 'advent-readings',
      title: 'Advent Readings',
      writing_count: 5,
    },
  ],
  slug: 'grace-for-today',
  slug_variants: [],
  tags: [],
  title: 'Grace for Today',
  writing_type: 'ARTICLE',
};

test('public reader shows referenced scriptures separately from resource metadata', async ({ page }) => {
  await page.route('**/v1/resources/grace-for-today/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: publicDetail,
      status: 200,
    });
  });

  await page.goto('/resources/grace-for-today');

  await expect(page.getByRole('heading', { level: 1, name: 'Grace for Today' })).toBeVisible();

  const referencedScriptures = page.getByRole('region', { name: 'Referenced Scriptures' });
  await expect(referencedScriptures).toBeVisible();
  await expect(referencedScriptures.getByRole('link')).toHaveCount(3);
  await expect(referencedScriptures.getByRole('link', { name: /John 3:16/ })).toHaveAttribute(
    'href',
    '/resources/book/John',
  );
  await expect(referencedScriptures.getByRole('link', { name: /2 Timothy 3:16/ })).toHaveCount(0);
  await referencedScriptures.getByRole('button', { name: /Show more/ }).click();
  await expect(referencedScriptures.getByRole('link')).toHaveCount(4);
  await expect(referencedScriptures.getByRole('link', { name: /2 Timothy 3:16/ })).toBeVisible();

  const shareArticle = page.getByRole('region', { name: 'Share this article' });
  const aboutResource = page.getByRole('region', { name: 'About this Resource' });
  const continueReading = page.getByRole('region', { name: 'Continue reading recommendations' });
  await expect(shareArticle).toBeVisible();
  await expect(continueReading).toBeVisible();
  const railOrder = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        '[aria-labelledby="share-article-title"], [aria-labelledby="about-resource-title"], [aria-label="Continue reading recommendations"], [aria-labelledby="referenced-scriptures-title"]',
      ),
    ).map((element) => element.getAttribute('aria-labelledby') || element.getAttribute('aria-label')),
  );
  expect(railOrder).toEqual([
    'share-article-title',
    'about-resource-title',
    'Continue reading recommendations',
    'referenced-scriptures-title',
  ]);

  await expect(aboutResource).toBeVisible();
  await expect(aboutResource).toContainText('Resource Type');
  await expect(aboutResource).toContainText('Devotional');
  await expect(aboutResource).toContainText('Category');
  await expect(aboutResource).toContainText('Prayer');
  await expect(aboutResource).toContainText('Series');
  await expect(aboutResource).toContainText('Advent Readings');
  await expect(aboutResource).not.toContainText('Scripture');
  await expect(aboutResource).not.toContainText('John 3:16');
});