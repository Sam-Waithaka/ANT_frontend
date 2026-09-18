// @vitest-environment jsdom

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MediaSeriesRail from '../../src/components/media/MediaSeriesRail';
import MediaSeriesPage from '../../src/pages/MediaSeriesPage';

const mocks = vi.hoisted(() => ({
  fetchAudioVisualSeriesDetail: vi.fn(),
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
      mediaType: 'sermon',
      mediaTypeLabel: 'Sermon',
      series: { name: 'Dying Well', slug: 'dying-well' },
      slug: 'dying-well-part-one',
      thumbnailUrl: '',
      title: 'Dying Well Part One',
    },
  ],
  name: 'Dying Well',
  slug: 'dying-well',
};

describe('MediaSeriesPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.fetchAudioVisualSeriesDetail.mockReset();
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
    expect(container.querySelector('h1')?.textContent).toBe('Dying Well');
    expect(container.querySelector('a[href="/media"]')?.textContent).toContain('Back to Media');
    expect(container.querySelector('a[href="/media/watch/dying-well-part-one"]')).not.toBeNull();
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

  it('shows a stable route-level error state when the series request fails', async () => {
    mocks.fetchAudioVisualSeriesDetail.mockRejectedValueOnce(new Error('Unavailable'));
    await renderPage();

    await vi.waitFor(() => expect(container.textContent).toContain('We could not load this series right now.'));
    expect(container.querySelector('a[href="/media"]')).not.toBeNull();
  });
});
