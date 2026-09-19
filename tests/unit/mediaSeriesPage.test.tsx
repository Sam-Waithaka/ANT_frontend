// @vitest-environment jsdom

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MediaRail from '../../src/components/media/MediaRail';
import MediaSeriesRail from '../../src/components/media/MediaSeriesRail';
import MediaSeriesPage from '../../src/pages/MediaSeriesPage';

const mocks = vi.hoisted(() => ({
  fetchAudioVisualItemPage: vi.fn(),
  fetchAudioVisualSeriesDetail: vi.fn(),
  share: vi.fn(),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false, toggleTheme: vi.fn() }),
}));

vi.mock('../../src/components/navigation/SiteHeader', () => ({
  default: () => <header>Site Header</header>,
}));

vi.mock('../../src/components/navigation/SiteFooter', () => ({
  default: () => <footer>Site Footer</footer>,
}));

vi.mock('../../src/services/audioVisualApi', () => ({
  fetchAudioVisualItemPage: mocks.fetchAudioVisualItemPage,
  fetchAudioVisualSeriesDetail: mocks.fetchAudioVisualSeriesDetail,
}));

const series = {
  description: 'Messages about finishing faithfully.',
  items: [
    {
      categories: [],
      collections: [],
      description: 'A sermon in the series.',
      descriptionExcerpt: 'A sermon in the series.',
      durationSeconds: 1800,
      id: 1,
      mediaType: 'sermon',
      mediaTypeLabel: 'Sermon',
      publishedAt: '2026-01-07T09:00:00Z',
      series: { name: 'Dying Well', slug: 'dying-well' },
      slug: 'dying-well-part-one',
      speaker: 'Rev. First Speaker',
      scriptureReference: '2 Timothy 4:7',
      thumbnailUrl: '',
      title: 'Dying Well Part One',
    },
  ],
  name: 'Dying Well',
  slug: 'dying-well',
};

const secondItem = {
  ...series.items[0],
  id: 2,
  publishedAt: '2026-01-14T09:00:00Z',
  slug: 'dying-well-part-two',
  speaker: 'Rev. Second Speaker',
  title: 'Dying Well Part Two',
};

describe('MediaSeriesPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.fetchAudioVisualItemPage.mockReset();
    mocks.fetchAudioVisualSeriesDetail.mockReset();
    mocks.share.mockReset();
    mocks.share.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: mocks.share,
    });
    mocks.fetchAudioVisualItemPage.mockResolvedValue({
      count: 2,
      items: series.items,
      next: '/v1/audio-visual/?series=dying-well&page=2',
      previous: null,
    });
    mocks.fetchAudioVisualSeriesDetail.mockResolvedValue(series);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  const renderPage = async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/media/series/dying-well']}>
          <Routes>
            <Route path="/media/series/:slug" element={<MediaSeriesPage />} />
          </Routes>
        </MemoryRouter>,
      );
      await Promise.resolve();
    });
  };

  it('loads the route slug and renders a canonical series page', async () => {
    await renderPage();

    await vi.waitFor(() => expect(container.textContent).toContain('Dying Well Part One'));
    expect(mocks.fetchAudioVisualSeriesDetail).toHaveBeenCalledWith('dying-well', expect.any(AbortSignal));
    expect(mocks.fetchAudioVisualItemPage).toHaveBeenCalledWith(
      { ordering: 'oldest', page: 1, pageSize: 12, series: 'dying-well' },
      expect.any(AbortSignal),
    );
    expect(container.querySelector('h1')?.textContent).toBe('Dying Well');
    expect(container.textContent).toContain('2 messages');
    expect(container.textContent).toContain('Messages in this series');
    expect(container.querySelector('a[href="/media"]')?.textContent).toContain('Back to Media');
    expect([...container.querySelectorAll('button')].some((button) => button.textContent === 'Share')).toBe(true);
    expect(container.querySelectorAll('a[href="/media/watch/dying-well-part-one"]')).toHaveLength(2);
    expect(container.textContent).toContain('Rev. First Speaker');
    expect(container.textContent).toContain('2 Timothy 4:7');
    expect(container.textContent?.match(/Message 1/g)).toHaveLength(2);
    const h1 = container.querySelector('h1');
    const h2 = container.querySelector('#series-messages-heading');
    expect(h1?.compareDocumentPosition(h2 as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    container.querySelectorAll<HTMLAnchorElement>('a[aria-label^="Watch "]').forEach((link) => {
      expect(link.querySelector('a, button')).toBeNull();
      expect(link.className).toContain('focus-visible:ring-2');
    });
  });

  it('shares the canonical series route with series metadata', async () => {
    await renderPage();

    const shareButton = await vi.waitFor(() => {
      const button = [...container.querySelectorAll('button')].find((item) => item.textContent === 'Share');
      expect(button).toBeDefined();
      return button as HTMLButtonElement;
    });
    await act(async () => shareButton.click());

    expect(mocks.share).toHaveBeenCalledWith({
      text: series.description,
      title: series.name,
      url: `${window.location.origin}/media/series/dying-well`,
    });
  });

  it('links series cards to their canonical route', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/media']}>
          <MediaSeriesRail
            darkMode={false}
            items={[{ description: 'Messages about finishing faithfully.', name: 'Dying Well', slug: 'dying-well' }]}
            returnTab="series"
          />
        </MemoryRouter>,
      );
    });

    expect(container.querySelector('a[href="/media/series/dying-well"]')?.textContent).toContain('Dying Well');
  });

  it('loads and appends the next page of series videos without duplicates', async () => {
    mocks.fetchAudioVisualItemPage
      .mockResolvedValueOnce({
        count: 2,
        items: series.items,
        next: '/v1/audio-visual/?series=dying-well&page=2',
        previous: null,
      })
      .mockResolvedValueOnce({
        count: 2,
        items: [series.items[0], secondItem],
        next: null,
        previous: '/v1/audio-visual/?series=dying-well&page=1',
      });
    await renderPage();

    const loadMore = await vi.waitFor(() => {
      const button = [...container.querySelectorAll('button')].find((item) => item.textContent?.includes('Load more'));
      expect(button).toBeDefined();
      return button as HTMLButtonElement;
    });
    await act(async () => loadMore.click());

    await vi.waitFor(() => expect(container.textContent).toContain('Dying Well Part Two'));
    expect(container.querySelectorAll('a[href="/media/watch/dying-well-part-one"]')).toHaveLength(2);
    expect(container.querySelectorAll('a[href="/media/watch/dying-well-part-two"]')).toHaveLength(1);
    expect(container.querySelector('a[href="/media/watch/dying-well-part-two"]')?.textContent).toContain('Message 2');
    expect(container.querySelectorAll('a[href="/media/watch/dying-well-part-one"]')[1]?.textContent).toContain('Message 1');
    expect(mocks.fetchAudioVisualItemPage).toHaveBeenLastCalledWith(
      { ordering: 'oldest', page: 2, pageSize: 12, series: 'dying-well' },
      expect.any(AbortSignal),
    );
    expect([...container.querySelectorAll('button')].some((item) => item.textContent?.includes('Load more'))).toBe(false);
  });

  it('preserves backend canonical order for equal dates and numbers that complete sequence', async () => {
    const canonicalFirst = {
      ...secondItem,
      publishedAt: series.items[0].publishedAt,
    };
    mocks.fetchAudioVisualItemPage.mockResolvedValueOnce({
      count: 2,
      items: [canonicalFirst, series.items[0]],
      next: null,
      previous: null,
    });
    await renderPage();

    const messageLinks = await vi.waitFor(() => {
      const links = [...container.querySelectorAll<HTMLAnchorElement>('a[aria-label^="Watch "]')];
      expect(links).toHaveLength(3);
      return links;
    });

    expect(messageLinks.map((link) => link.getAttribute('aria-label'))).toEqual([
      'Watch Dying Well Part Two',
      'Watch Dying Well Part Two',
      'Watch Dying Well Part One',
    ]);
    expect(messageLinks[0]?.textContent).toContain('Message 1');
    expect(messageLinks[1]?.textContent).toContain('Message 1');
    expect(messageLinks[2]?.textContent).toContain('Message 2');
    expect(container.textContent).toContain('Rev. First Speaker');
    expect(container.textContent).toContain('Rev. Second Speaker');
  });

  it('retains series information and renders a deliberate empty state', async () => {
    mocks.fetchAudioVisualItemPage.mockResolvedValueOnce({
      count: 0,
      items: [],
      next: null,
      previous: null,
    });
    mocks.fetchAudioVisualSeriesDetail.mockResolvedValueOnce({ ...series, items: [] });
    await renderPage();

    await vi.waitFor(() => expect(container.textContent).toContain('There are no messages in this series yet.'));
    expect(container.querySelector('h1')?.textContent).toBe('Dying Well');
    expect(container.textContent).toContain('Messages about finishing faithfully.');
    expect(container.textContent).toContain('0 messages');
    expect(container.querySelector('a[aria-label^="Watch "]')).toBeNull();
  });

  it('handles a single-message series with missing optional card metadata', async () => {
    const sparseItem = {
      ...series.items[0],
      description: '',
      descriptionExcerpt: '',
      durationSeconds: undefined,
      publishedAt: undefined,
      speaker: undefined,
      scriptureReference: undefined,
      thumbnailUrl: '',
    };
    mocks.fetchAudioVisualItemPage.mockResolvedValueOnce({
      count: 1,
      items: [sparseItem],
      next: null,
      previous: null,
    });
    mocks.fetchAudioVisualSeriesDetail.mockResolvedValueOnce({
      ...series,
      description: undefined,
      items: [sparseItem],
      name: 'A Single Message',
      slug: 'dying-well',
    });
    await renderPage();

    await vi.waitFor(() => expect(container.querySelector('h1')?.textContent).toBe('A Single Message'));
    expect(container.textContent).toContain('1 message');
    expect(container.textContent).not.toContain('1 messages');
    expect(container.textContent).not.toContain('Messages about finishing faithfully.');
    expect(container.querySelectorAll('a[aria-label="Watch Dying Well Part One"]')).toHaveLength(2);
    expect(container.textContent?.match(/Message 1/g)).toHaveLength(2);
    expect(container.textContent).not.toContain('Rev. First Speaker');
    expect(container.textContent).not.toContain('2 Timothy 4:7');
    expect(container.textContent).not.toContain('2026');
    expect(container.querySelector('img')).toBeNull();
  });

  it('keeps the established Media grid and leaves ordinary Media cards unlabeled', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/media']}>
          <MediaRail darkMode={false} items={series.items} title="Latest Sermons" />
        </MemoryRouter>,
      );
    });

    const establishedGrid = [...container.querySelectorAll<HTMLDivElement>('div')].find((element) =>
      element.className.includes('sm:grid-cols-2')
      && element.className.includes('lg:grid-cols-3')
      && element.className.includes('xl:grid-cols-4'));
    expect(establishedGrid).toBeDefined();
    expect(container.textContent).not.toContain('Message 1');
    const ordinaryCard = container.querySelector<HTMLAnchorElement>('a[href="/media/watch/dying-well-part-one"]');
    expect(ordinaryCard).not.toBeNull();
    expect(ordinaryCard?.getAttribute('aria-label')).toBeNull();
    expect(ordinaryCard?.className).toBe('group block min-w-0');
  });

  it('shows a stable route-level error state when the series request fails', async () => {
    mocks.fetchAudioVisualSeriesDetail.mockRejectedValueOnce(new Error('Unavailable'));
    await renderPage();

    await vi.waitFor(() => expect(container.textContent).toContain('We could not load this series right now.'));
    expect(container.querySelector('a[href="/media"]')).not.toBeNull();
  });
});
