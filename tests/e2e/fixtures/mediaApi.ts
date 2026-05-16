import type { Page, Route } from '@playwright/test';
import { fulfillJson } from './scriptureApi';

const thumbnail = '/images/church-front-left-1920.jpg';

const mediaItem = (overrides: Record<string, unknown>) => ({
  categories: [{ name: 'Sermons', slug: 'sermons' }],
  collections: [{ name: 'Latest Sermons', slug: 'latest-sermons' }],
  description: 'A reflective message that calls the church to trust Christ with courage and humility.',
  description_excerpt: 'Learning to trust Christ with courage and humility.',
  duration_seconds: 2339,
  embed_url: '',
  external_url: '',
  language: 'english',
  media_type: 'sermon',
  media_type_detail: { name: 'Sermon' },
  provider: 'youtube',
  published_at: '2026-05-10T08:30:00Z',
  scripture_reference: 'John 20:1',
  series: { name: 'Dying Well', slug: 'dying-well', item_count: 2, thumbnail_url: thumbnail },
  speaker: 'Rev. Harun Njuguna',
  thumbnail_url: thumbnail,
  title: 'Dying Well',
  slug: 'dying-well',
  ...overrides,
});

export const dyingWell = mediaItem({
  title: 'Dying Well',
  slug: 'dying-well',
  description: 'Dying well is the natural conclusion of a life lived intentionally for God.',
  description_excerpt: 'Dying well is the natural conclusion of a life lived intentionally for God.',
});

export const purposeProceeds = mediaItem({
  title: 'Purpose Proceeds without permission',
  slug: 'purpose-proceeds-without-permission',
  speaker: 'Rev. Dr. William Koros',
  published_at: '2026-05-03T08:30:00Z',
});

export const finalInstructions = mediaItem({
  title: 'My Final Instructions',
  slug: 'my-final-instructions',
  speaker: 'Pst. Franck Odu',
  published_at: '2026-04-27T08:30:00Z',
  series: { name: 'Final Instructions', slug: 'final-instructions', item_count: 1, thumbnail_url: thumbnail },
});

export const sundayService = mediaItem({
  title: 'Sunday Service II English',
  slug: 'sunday-service-english',
  duration_seconds: 7624,
  live_status: 'completed',
  media_type: 'livestream',
  media_type_detail: { name: 'Livestream' },
  series: null,
});

export const shortClip = mediaItem({
  title: 'God Loves to Forgive Repentant Sinners',
  slug: 'god-loves-to-forgive-repentant-sinners',
  description_excerpt: 'A short reminder of mercy.',
  duration_seconds: 54,
  media_type: 'short',
  media_type_detail: { name: 'Short' },
  series: null,
});

export const secondShort = mediaItem({
  title: 'Live the Simple Things in Life',
  slug: 'live-the-simple-things-in-life',
  description_excerpt: 'A short encouragement for daily faithfulness.',
  duration_seconds: 87,
  media_type: 'short',
  media_type_detail: { name: 'Short' },
  series: null,
});

export const choirSong = mediaItem({
  title: 'Nipiga Makasia',
  slug: 'nipiga-makasia',
  categories: [{ name: 'Choir', slug: 'choir' }],
  collections: [{ name: 'Music', slug: 'music' }],
  description_excerpt: 'A church choir song of praise.',
  duration_seconds: 290,
  media_type: 'Music',
  media_type_detail: { name: 'Music' },
  series: null,
  speaker: 'A.I.C Njoro Town Church Choir',
});

export const worshipSong = mediaItem({
  title: 'Mercy Masika Wastahili Cover',
  slug: 'mercy-masika-wastahili-cover',
  categories: [{ name: 'Praise and Worship', slug: 'praise-and-worship' }],
  collections: [{ name: 'Music', slug: 'music' }],
  description_excerpt: 'Praise and worship from the church team.',
  duration_seconds: 335,
  media_type: 'Music',
  media_type_detail: { name: 'Music' },
  series: null,
  speaker: 'Praise and Worship Team',
});

export const musicOtherVideo = mediaItem({
  title: 'A.I.C Njoro Town Music Moment',
  slug: 'aic-njoro-town-music-moment',
  categories: [{ name: 'Music Explore', slug: 'music-explore' }],
  collections: [{ name: 'Music', slug: 'music' }],
  description_excerpt: 'A music moment awaiting a more specific subcategory.',
  duration_seconds: 180,
  media_type: 'Music',
  media_type_detail: { name: 'Music' },
  series: null,
  speaker: 'A.I.C Njoro Town',
});

export const teachingMessage = mediaItem({
  title: 'Learning to Trust God in Every Season',
  slug: 'learning-to-trust-god-in-every-season',
  categories: [{ name: 'Teaching', slug: 'teaching' }],
  collections: [{ name: 'Teachings', slug: 'teachings' }],
  description_excerpt: 'A teaching for trusting God in difficult seasons.',
  duration_seconds: 2520,
  media_type: 'teaching',
  media_type_detail: { name: 'Teaching' },
  series: null,
  speaker: 'Peter Wanjohi',
});

export const otherVideo = mediaItem({
  title: 'Church Family Update',
  slug: 'church-family-update',
  categories: [{ name: 'Other', slug: 'other' }],
  collections: [{ name: 'Explore', slug: 'explore' }],
  description_excerpt: 'An update from the life of the church.',
  duration_seconds: 420,
  media_type: 'other',
  media_type_detail: { name: 'Other' },
  series: null,
  speaker: 'A.I.C Njoro Town',
});

const allItems = [
  dyingWell,
  purposeProceeds,
  finalInstructions,
  sundayService,
  shortClip,
  secondShort,
  choirSong,
  worshipSong,
  musicOtherVideo,
  teachingMessage,
  otherVideo,
];

const pagePayload = (items: unknown[], count = items.length) => ({
  count,
  next: count > items.length ? '/v1/audio-visual/?page=2' : null,
  previous: null,
  results: items,
});

const listPayload = (items: unknown[]) => pagePayload(items);

const itemsForQuery = (url: URL) => {
  const type = url.searchParams.get('type')?.toLowerCase();
  const featured = url.searchParams.get('featured');
  const series = url.searchParams.get('series');
  const category = url.searchParams.get('category');
  const musicSubcategory = url.searchParams.get('music_subcategory');

  if (featured === 'true') {
    return [dyingWell, finalInstructions];
  }

  if (series === 'dying-well') {
    return [dyingWell, purposeProceeds];
  }

  if (category === 'sermons') {
    return [dyingWell, purposeProceeds, finalInstructions];
  }

  if (type === 'sermon') {
    return [dyingWell, purposeProceeds, finalInstructions];
  }

  if (type === 'livestream') {
    return [sundayService];
  }

  if (type === 'short') {
    return [shortClip, secondShort];
  }

  if (type === 'music') {
    if (musicSubcategory === 'choir') {
      return [choirSong];
    }

    if (musicSubcategory === 'pnw') {
      return [worshipSong];
    }

    if (musicSubcategory === 'other') {
      return [musicOtherVideo];
    }

    return [choirSong, worshipSong];
  }

  if (type === 'teaching') {
    return [teachingMessage];
  }

  if (type === 'other') {
    return [otherVideo];
  }

  return allItems;
};

export const mockMediaApi = async (page: Page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,svg}', async (route) => route.fulfill({
    status: 200,
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#111"/><text x="32" y="180" fill="#fff" font-size="32">AIC Njoro Town</text></svg>',
  }));

  await page.route('**/v1/audio-visual/**', async (route: Route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;

    if (pathname === '/v1/audio-visual/home/') {
      await fulfillJson(route, {
        generated_at: '2026-05-13T12:00:00Z',
        hero: purposeProceeds,
        live: { cta_label: 'Join the service live', item: sundayService },
        rails: [
          { key: 'featured', title: 'Featured', items: [dyingWell, finalInstructions] },
          { key: 'shorts', title: 'Shorts & Highlights', items: [shortClip, secondShort] },
        ],
      });
      return;
    }

    if (pathname === '/v1/audio-visual/rails/') {
      await fulfillJson(route, { rails: [{ key: 'featured', title: 'Featured', items: [dyingWell] }] });
      return;
    }

    if (pathname === '/v1/audio-visual/featured/') {
      await fulfillJson(route, [dyingWell, finalInstructions]);
      return;
    }

    if (pathname === '/v1/audio-visual/latest-sermon/') {
      await fulfillJson(route, dyingWell);
      return;
    }

    if (pathname === '/v1/audio-visual/live/') {
      await fulfillJson(route, sundayService);
      return;
    }

    if (pathname === '/v1/audio-visual/series/') {
      await fulfillJson(route, [
        { name: 'Dying Well', slug: 'dying-well', description: 'Messages about finishing faithfully.', item_count: 2, thumbnail_url: thumbnail },
        { name: 'Final Instructions', slug: 'final-instructions', description: 'Pastoral closing counsel.', item_count: 1, thumbnail_url: thumbnail },
      ]);
      return;
    }

    if (pathname === '/v1/audio-visual/series/dying-well/') {
      await fulfillJson(route, {
        name: 'Dying Well',
        slug: 'dying-well',
        description: 'Messages about finishing faithfully.',
        items: [dyingWell, purposeProceeds],
      });
      return;
    }

    if (pathname === '/v1/audio-visual/media-types/') {
      await fulfillJson(route, [
        { name: 'Sermon', slug: 'sermon', count: 3 },
        { name: 'Music', slug: 'music', count: 2 },
        { name: 'Teaching', slug: 'teaching', count: 1 },
      ]);
      return;
    }

    if (pathname === '/v1/audio-visual/languages/') {
      await fulfillJson(route, [{ name: 'English', slug: 'english' }]);
      return;
    }

    if (pathname === '/v1/audio-visual/categories/') {
      await fulfillJson(route, [{ name: 'Sermons', slug: 'sermons' }, { name: 'Choir', slug: 'choir' }]);
      return;
    }

    if (pathname === '/v1/audio-visual/collections/') {
      await fulfillJson(route, [{ name: 'Latest Sermons', slug: 'latest-sermons' }, { name: 'Music', slug: 'music' }]);
      return;
    }

    const watchMatch = pathname.match(/^\/v1\/audio-visual\/watch\/([^/]+)\/$/);

    if (watchMatch) {
      const slug = decodeURIComponent(watchMatch[1]);
      const item = allItems.find((candidate) => candidate.slug === slug);
      await fulfillJson(route, item ?? { detail: 'Not found' }, item ? 200 : 404);
      return;
    }

    if (pathname === '/v1/audio-visual/latest/') {
      await fulfillJson(route, listPayload(allItems));
      return;
    }

    if (pathname === '/v1/audio-visual/') {
      const matchingItems = itemsForQuery(url);
      await fulfillJson(route, pagePayload(matchingItems, matchingItems.length > 1 ? matchingItems.length + 2 : matchingItems.length));
      return;
    }

    await route.fallback();
  });

  await page.route('**/www.youtube.com/**', async (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<html><body>YouTube fixture</body></html>',
  }));
};
