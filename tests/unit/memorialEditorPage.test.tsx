// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MemorialEditorPage from '../../src/pages/portal/memorials/MemorialEditorPage';
import type { MemorialEditorState } from '../../src/types/memorial';

const mocks = vi.hoisted(() => ({
  createMemorialArrangement: vi.fn(),
  createMemorialGalleryItem: vi.fn(),
  createMemorialMinistryTribute: vi.fn(),
  createMemorialPersonalTribute: vi.fn(),
  createMemorialRecordingSection: vi.fn(),
  createMemorialRichTextBlock: vi.fn(),
  createMemorialRichTextMediaEmbed: vi.fn(),
  createMemorialRichTextScriptureReference: vi.fn(),
  createMemorialTimelineEvent: vi.fn(),
  deleteMemorialArrangement: vi.fn(),
  deleteMemorialGalleryItem: vi.fn(),
  deleteMemorialMinistryTribute: vi.fn(),
  deleteMemorialPersonalTribute: vi.fn(),
  deleteMemorialRecordingSection: vi.fn(),
  deleteMemorialRichTextMediaEmbed: vi.fn(),
  deleteMemorialRichTextScriptureReference: vi.fn(),
  deleteMemorialTimelineEvent: vi.fn(),
  fetchAudioVisualItemPage: vi.fn(),
  fetchAudioVisualSeries: vi.fn(),
  fetchAudioVisualSeriesDetail: vi.fn(),
  fetchMemorialEditorState: vi.fn(),
  runMemorialWorkflowAction: vi.fn(),
  updateMemorialArrangement: vi.fn(),
  updateMemorialGalleryItem: vi.fn(),
  updateMemorialMinistryTribute: vi.fn(),
  updateMemorialPersonalTribute: vi.fn(),
  updateMemorialRecordingSection: vi.fn(),
  updateMemorialRichTextBlock: vi.fn(),
  updateMemorialRichTextMediaEmbed: vi.fn(),
  updateMemorialRichTextScriptureReference: vi.fn(),
  updateMemorialTimelineEvent: vi.fn(),
  updateMemorialPage: vi.fn(),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false, toggleTheme: vi.fn() }),
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: 'access-token', permissions: [] }),
}));

vi.mock('../../src/components/navigation/SiteHeader', () => ({
  default: () => <header>Site header</header>,
}));

vi.mock('../../src/components/navigation/SiteFooter', () => ({
  default: () => <footer>Site footer</footer>,
}));

vi.mock('../../src/services/audioVisualApi', () => ({
  fetchAudioVisualItemPage: mocks.fetchAudioVisualItemPage,
  fetchAudioVisualSeries: mocks.fetchAudioVisualSeries,
  fetchAudioVisualSeriesDetail: mocks.fetchAudioVisualSeriesDetail,
}));
vi.mock('../../src/services/memorialApi', () => ({
  createMemorialArrangement: mocks.createMemorialArrangement,
  createMemorialGalleryItem: mocks.createMemorialGalleryItem,
  createMemorialMinistryTribute: mocks.createMemorialMinistryTribute,
  createMemorialPersonalTribute: mocks.createMemorialPersonalTribute,
  createMemorialRecordingSection: mocks.createMemorialRecordingSection,
  createMemorialRichTextBlock: mocks.createMemorialRichTextBlock,
  createMemorialRichTextMediaEmbed: mocks.createMemorialRichTextMediaEmbed,
  createMemorialRichTextScriptureReference: mocks.createMemorialRichTextScriptureReference,
  createMemorialTimelineEvent: mocks.createMemorialTimelineEvent,
  deleteMemorialArrangement: mocks.deleteMemorialArrangement,
  deleteMemorialGalleryItem: mocks.deleteMemorialGalleryItem,
  deleteMemorialMinistryTribute: mocks.deleteMemorialMinistryTribute,
  deleteMemorialPersonalTribute: mocks.deleteMemorialPersonalTribute,
  deleteMemorialRecordingSection: mocks.deleteMemorialRecordingSection,
  deleteMemorialRichTextMediaEmbed: mocks.deleteMemorialRichTextMediaEmbed,
  deleteMemorialRichTextScriptureReference: mocks.deleteMemorialRichTextScriptureReference,
  deleteMemorialTimelineEvent: mocks.deleteMemorialTimelineEvent,
  fetchMemorialEditorState: mocks.fetchMemorialEditorState,
  runMemorialWorkflowAction: mocks.runMemorialWorkflowAction,
  updateMemorialArrangement: mocks.updateMemorialArrangement,
  updateMemorialGalleryItem: mocks.updateMemorialGalleryItem,
  updateMemorialMinistryTribute: mocks.updateMemorialMinistryTribute,
  updateMemorialPersonalTribute: mocks.updateMemorialPersonalTribute,
  updateMemorialRecordingSection: mocks.updateMemorialRecordingSection,
  updateMemorialRichTextBlock: mocks.updateMemorialRichTextBlock,
  updateMemorialRichTextMediaEmbed: mocks.updateMemorialRichTextMediaEmbed,
  updateMemorialRichTextScriptureReference: mocks.updateMemorialRichTextScriptureReference,
  updateMemorialTimelineEvent: mocks.updateMemorialTimelineEvent,
  updateMemorialPage: mocks.updateMemorialPage,
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

const changeInput = async (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  await act(async () => {
    const prototype = input instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const changeSelect = async (select: HTMLSelectElement, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
    setter?.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

describe('MemorialEditorPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.fetchMemorialEditorState.mockResolvedValue(editorState());
    mocks.fetchAudioVisualSeries.mockResolvedValue([
      { id: 9, itemCount: 1, name: 'Legacy sermon series', slug: 'legacy-sermons' },
    ]);
    mocks.fetchAudioVisualSeriesDetail.mockResolvedValue({
      id: 9,
      itemCount: 1,
      items: [
        {
          categories: [],
          collections: [],
          description: 'A recording from the memorial series.',
          descriptionExcerpt: 'A recording from the memorial series.',
          durationSeconds: 600,
          id: 901,
          mediaType: 'sermon',
          mediaTypeLabel: 'Sermon',
          publishedAt: '2026-09-18T10:00:00Z',
          series: { id: 9, name: 'Legacy sermon series', slug: 'legacy-sermons' },
          slug: 'legacy-preview-sermon',
          speaker: 'Rev. Jane Doe',
          thumbnailUrl: '/recording.jpg',
          title: 'Legacy preview sermon',
        },
      ],
      name: 'Legacy sermon series',
      slug: 'legacy-sermons',
    });
    mocks.fetchAudioVisualItemPage.mockResolvedValue({
      count: 1,
      items: [
        {
          categories: [],
          collections: [],
          description: 'A recording from the memorial series.',
          descriptionExcerpt: 'A recording from the memorial series.',
          durationSeconds: 600,
          id: 901,
          mediaType: 'sermon',
          mediaTypeLabel: 'Sermon',
          publishedAt: '2026-09-18T10:00:00Z',
          series: { id: 9, name: 'Legacy sermon series', slug: 'legacy-sermons' },
          slug: 'legacy-preview-sermon',
          speaker: 'Rev. Jane Doe',
          thumbnailUrl: '/recording.jpg',
          title: 'Legacy preview sermon',
        },
      ],
      next: null,
      previous: null,
    });
    mocks.updateMemorialPage.mockImplementation((_, __, payload) =>
      Promise.resolve({ ...editorState().page, ...payload }),
    );
    mocks.updateMemorialRichTextBlock.mockImplementation((_, __, payload) =>
      Promise.resolve({ ...editorState().rich_text_blocks[0], ...payload }),
    );
    mocks.updateMemorialMinistryTribute.mockImplementation((_, __, payload) =>
      Promise.resolve({
        ...editorState().ministry_tributes[0],
        ...payload,
        display_ministry_name: payload.ministry_name,
      }),
    );
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.querySelectorAll('[role="dialog"]').forEach((dialog) => dialog.remove());
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
    await vi.waitFor(() => expect(container.textContent).toContain('Legacy preview sermon'));
    expect(mocks.fetchAudioVisualItemPage).toHaveBeenCalledWith(
      { ordering: 'oldest', pageSize: 3, series: 'legacy-sermons' },
      expect.any(AbortSignal),
    );
    expect(container.textContent).toContain('Funeral service');
  });

  it('saves changed memorial page shell settings', async () => {
    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Rev. Jane Doe'));

    const fullNameInput = Array.from(container.querySelectorAll('input')).find((input) =>
      input.value === 'Rev. Jane Doe',
    ) as HTMLInputElement;
    await changeInput(fullNameInput, 'Rev. Jane Updated');
    await changeSelect(container.querySelector('select') as HTMLSelectElement, 'ARCHIVED');

    const saveButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Save shell'),
    ) as HTMLButtonElement;
    await act(async () => saveButton.click());

    await vi.waitFor(() => expect(mocks.updateMemorialPage).toHaveBeenCalled());
    expect(mocks.updateMemorialPage).toHaveBeenCalledWith('access-token', 42, {
      full_name: 'Rev. Jane Updated',
      status: 'ARCHIVED',
    });
    await vi.waitFor(() => expect(container.textContent).toContain('Rev. Jane Updated'));
  });

  it('saves changed memorial rich text block settings through memorial endpoints', async () => {
    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Hero welcome'));

    const sectionTitleInput = Array.from(container.querySelectorAll('input')).find((input) =>
      input.value === 'Hero welcome',
    ) as HTMLInputElement;
    await changeInput(sectionTitleInput, 'Hero remembrance');

    const saveBlockButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Save block'),
    ) as HTMLButtonElement;
    await act(async () => saveBlockButton.click());

    await vi.waitFor(() => expect(mocks.updateMemorialRichTextBlock).toHaveBeenCalled());
    expect(mocks.updateMemorialRichTextBlock).toHaveBeenCalledWith('access-token', 10, expect.objectContaining({
      is_visible: false,
      status: 'DRAFT',
      subtitle: '',
      title: 'Hero remembrance',
    }));
    await vi.waitFor(() => expect(container.textContent).toContain('Hero remembrance'));
  });

  it('runs workflow actions through the shared memorial workflow endpoint', async () => {
    mocks.runMemorialWorkflowAction.mockImplementation((_, __, ___, action) =>
      Promise.resolve({
        ...editorState().rich_text_blocks[0],
        status: action === 'approve' ? 'APPROVED' : 'DRAFT',
      }),
    );

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Hero welcome'));

    const approveButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Approve'),
    ) as HTMLButtonElement;
    await act(async () => approveButton.click());

    await vi.waitFor(() => expect(mocks.runMemorialWorkflowAction).toHaveBeenCalled());
    expect(mocks.runMemorialWorkflowAction).toHaveBeenCalledWith(
      'access-token',
      'rich-text-blocks',
      10,
      'approve',
    );
  });
  it('saves specialist child records through their memorial endpoints', async () => {
    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Ministry Board'));

    const firstEditButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Edit'),
    ) as HTMLButtonElement;
    await act(async () => firstEditButton.click());

    const dialog = document.body.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.textContent).toContain('Ministry tributes');

    const ministryInput = Array.from(dialog.querySelectorAll('input')).find((input) =>
      input.value === 'Ministry Board',
    ) as HTMLInputElement;
    await changeInput(ministryInput, 'Ministry Council');

    const saveButton = Array.from(dialog.querySelectorAll('button')).find((button) =>
      button.textContent?.trim() === 'Save',
    ) as HTMLButtonElement;
    await act(async () => saveButton.click());

    await vi.waitFor(() => expect(mocks.updateMemorialMinistryTribute).toHaveBeenCalled());
    expect(mocks.updateMemorialMinistryTribute).toHaveBeenCalledWith('access-token', 30, expect.objectContaining({
      content_block: '11',
      is_visible: false,
      ministry: null,
      ministry_name: 'Ministry Council',
      order: 1,
      representative_photo: null,
      speaker_name: 'Elder Mary',
      status: 'DRAFT',
    }));
    await vi.waitFor(() => expect(container.textContent).toContain('Ministry Council'));
  });
});