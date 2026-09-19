// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MemorialEditorPage from '../../src/pages/portal/memorials/MemorialEditorPage';
import type { MemorialEditorState } from '../../src/types/memorial';

const mocks = vi.hoisted(() => ({
  fetchMemorialEditorState: vi.fn(),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false, toggleTheme: vi.fn() }),
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: 'access-token' }),
}));

vi.mock('../../src/components/navigation/SiteHeader', () => ({
  default: () => <header>Site header</header>,
}));

vi.mock('../../src/components/navigation/SiteFooter', () => ({
  default: () => <footer>Site footer</footer>,
}));

vi.mock('../../src/services/memorialApi', () => ({
  fetchMemorialEditorState: mocks.fetchMemorialEditorState,
}));

const workflow = {
  is_visible: false,
  status: 'DRAFT' as const,
};

const editorState = (): MemorialEditorState => ({
  arrangements: [
    {
      ...workflow,
      arrangement_type: 'FUNERAL_SERVICE',
      content_block: null,
      id: 70,
      is_prominent: true,
      livestream_url: 'https://example.com/live',
      location_name: 'Main Sanctuary',
      memorial: 42,
      order: 1,
      starts_at: '2026-09-20T09:00:00Z',
      title: 'Funeral service',
    },
  ],
  gallery_items: [
    {
      ...workflow,
      caption: 'Family photo',
      category: 'FAMILY',
      id: 50,
      media_asset: 5,
      media_asset_detail: {
        alt_text: 'Family gathered at church',
        id: 5,
        title: 'Family gallery',
        url: '/family.jpg',
      },
      memorial: 42,
      order: 1,
    },
  ],
  media_embeds: [
    {
      block: 10,
      caption_override: 'Inline portrait',
      id: 80,
      media_asset: 8,
      media_asset_detail: {
        alt_text: 'Portrait',
        id: 8,
        title: 'Portrait media',
        url: '/portrait.jpg',
      },
      order: 1,
      position_hint: 'root.children.0',
    },
  ],
  ministry_tributes: [
    {
      ...workflow,
      content_block: 11,
      content_block_detail: {
        ...workflow,
        content_json: { root: { children: [], type: 'root' } },
        content_text: 'A faithful ministry servant.',
        id: 11,
        memorial: 42,
        order: 1,
        section_key: 'MINISTRY_LEGACY',
        title: 'Ministry reflection',
      },
      display_ministry_name: 'Ministry Board',
      id: 30,
      memorial: 42,
      order: 1,
      speaker_name: 'Elder Mary',
    },
  ],
  page: {
    ...workflow,
    full_name: 'Rev. Jane Doe',
    id: 42,
    is_visible: true,
    role_title: 'LCC Chairperson',
    slug: 'rev-jane-doe',
    status: 'PUBLISHED',
    summary: 'Served the church faithfully.',
    updated_at: '2026-09-19T09:00:00Z',
  },
  personal_tributes: [
    {
      ...workflow,
      author_name: 'John Friend',
      content_block: null,
      id: 40,
      memorial: 42,
      order: 1,
      relationship_to_deceased: 'Friend',
    },
  ],
  recording_sections: [
    {
      ...workflow,
      audio_visual_series: 9,
      audio_visual_series_detail: {
        id: 9,
        name: 'Legacy sermon series',
        slug: 'legacy-sermons',
      },
      content_block: null,
      id: 60,
      max_items: 3,
      memorial: 42,
      order: 1,
      title: 'Memorial recordings',
    },
  ],
  rich_text_blocks: [
    {
      ...workflow,
      content_json: { root: { children: [], type: 'root' } },
      content_text: 'Welcome to the memorial page.',
      id: 10,
      memorial: 42,
      order: 1,
      reading_time_minutes: 2,
      section_key: 'HERO',
      title: 'Hero welcome',
    },
  ],
  scripture_references: [
    {
      block: 10,
      book: 'John',
      chapter_start: 11,
      display_text: 'John 11:25',
      id: 90,
      passage_label: 'John 11:25',
      verse_start: 25,
      version: 'BSB',
    },
  ],
  section_keys: ['HERO', 'MINISTRY_LEGACY', 'GALLERY', 'RECORDINGS', 'ARRANGEMENTS'],
  timeline_events: [
    {
      ...workflow,
      content_block: null,
      date_label: '1998',
      id: 20,
      memorial: 42,
      order: 1,
      title: 'Joined leadership',
    },
  ],
});

const renderPage = async (root: Root) => {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/portal/memorials/42']}>
        <Routes>
          <Route path="/portal/memorials/:id" element={<MemorialEditorPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
};

describe('MemorialEditorPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.fetchMemorialEditorState.mockReset();
    mocks.fetchMemorialEditorState.mockResolvedValue(editorState());
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('hydrates and renders the bundled memorial editor structure', async () => {
    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Rev. Jane Doe'));
    expect(mocks.fetchMemorialEditorState).toHaveBeenCalledWith(
      'access-token',
      '42',
      expect.any(AbortSignal),
    );
    expect(container.textContent).toContain('Hero welcome');
    expect(container.textContent).toContain('Inline portrait');
    expect(container.textContent).toContain('John 11:25');
    expect(container.textContent).toContain('Ministry Board');
    expect(container.textContent).toContain('John Friend');
    expect(container.textContent).toContain('Joined leadership');
    expect(container.textContent).toContain('Family photo');
    expect(container.textContent).toContain('Legacy sermon series');
    expect(container.textContent).toContain('Funeral service');
  });
});

