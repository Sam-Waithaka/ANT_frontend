import { describe, expect, it } from 'vitest';
import {
  normalizeBooksResponse,
  normalizeChapterDetailResponse,
  normalizeChaptersResponse,
  normalizeComparisonResponse,
  normalizePaginatedResponse,
  normalizeSearchRecordsResponse,
  normalizeVersionsResponse,
} from '../../src/services/scriptureNormalizers';

describe('scriptureNormalizers', () => {
  it('normalizes version metadata from the documented API shape', () => {
    expect(
      normalizeVersionsResponse([
        {
          abbreviation: 'ASV',
          is_public: true,
          language: 'English',
          language_code: 'en',
          license_notes: 'Public domain text.',
          license_type: 'Public Domain',
          license_url: 'https://example.com/license',
          name: 'American Standard Version',
          publication_year: 1901,
          source: 'eBible',
          source_url: 'https://example.com/source',
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        abbreviation: 'ASV',
        id: 'ASV',
        isPublic: true,
        languageCode: 'en',
        licenseType: 'Public Domain',
        name: 'American Standard Version',
        publicationYear: 1901,
        source: 'eBible',
      }),
    ]);
  });

  it('normalizes localized book display names while preserving OSIS ids for routing', () => {
    expect(
      normalizeBooksResponse([
        {
          abbreviation: 'Mt',
          canonical_abbreviation: 'Matt',
          canonical_name: 'Matthew',
          name: 'Mathayo',
          number: 40,
          osis_id: 'Matt',
          testament: 'NT',
        },
      ]),
    ).toEqual([
      {
        abbreviation: 'Mt',
        canonicalAbbreviation: 'Matt',
        canonicalName: 'Matthew',
        id: 'Matt',
        longName: undefined,
        name: 'Mathayo',
        number: 40,
        testament: 'new',
      },
    ]);
  });

  it('normalizes chapter lists wrapped in the backend chapters property', () => {
    expect(
      normalizeChaptersResponse({
        chapter_numbers: [1, 2],
        chapters: [
          { id: 1, label: 'Chapter 1', number: 1 },
          { id: 2, label: 'Chapter 2', number: 2 },
        ],
      }),
    ).toEqual([
      { id: '1', label: 'Chapter 1', number: 1 },
      { id: '2', label: 'Chapter 2', number: 2 },
    ]);
  });

  it('normalizes chapter detail with omitted verse markers and license notes', () => {
    expect(
      normalizeChapterDetailResponse({
        credit: {
          license_notes: 'Public domain test scripture.',
        },
        verses: [
          {
            cross_references: [{ reference: 'John 1:1', text: 'The Word was in the beginning.' }],
            footnotes: [{ text: 'Genesis opens the biblical story.' }],
            id: 'gen-1-1',
            is_present: true,
            text: 'In the beginning God created the heavens and the earth.',
            verse_number: 1,
          },
          {
            display: 'footnote_only',
            footnotes: [{ note_type: 'verse_marker', text: 'Verse not present in this source.' }],
            is_present: false,
            markers: [{ note: 'Source file contains a verse marker with no verse text.', status: 'omitted' }],
            text: '',
            verse_number: 2,
          },
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        id: 'gen-1-1',
        isPresent: true,
        notes: expect.arrayContaining([
          expect.objectContaining({ text: 'Genesis opens the biblical story.' }),
          expect.objectContaining({ reference: 'John 1:1', type: 'cross_reference' }),
        ]),
        number: 1,
      }),
      expect.objectContaining({
        display: 'footnote_only',
        isPresent: false,
        markers: [{ note: 'Source file contains a verse marker with no verse text.', status: 'omitted' }],
        number: 2,
      }),
      expect.objectContaining({
        id: '__chapter_meta__',
        notes: [expect.objectContaining({ reference: 'license', text: 'Public domain test scripture.' })],
        number: 0,
      }),
    ]);
  });

  it('normalizes paginated responses without losing count and navigation links', () => {
    expect(
      normalizePaginatedResponse(
        {
          count: 94,
          next: 'https://api.aicnjoro.org/v1/bible/search/?page=2',
          previous: null,
          results: [{ term: 'altar' }],
        },
        (item) => item,
      ),
    ).toEqual({
      count: 94,
      next: 'https://api.aicnjoro.org/v1/bible/search/?page=2',
      previous: null,
      results: [{ term: 'altar' }],
    });
  });

  it('normalizes search results with localized references and backend highlights', () => {
    expect(
      normalizeSearchRecordsResponse({
        count: 1,
        results: [
          {
            book: { name: 'Yohana', osis_id: 'John' },
            chapter: 3,
            headline: 'Kwa maana Mungu <mark>aliupenda</mark> ulimwengu.',
            reference: 'Yohana 3:16',
            search_type: 'full_text',
            version: 'SWNT',
            verse_number: 16,
          },
        ],
      }),
    ).toEqual([
      {
        body: 'Kwa maana Mungu <mark>aliupenda</mark> ulimwengu.',
        id: 'Yohana 3:16-0',
        meta: 'full_text',
        subtitle: 'SWNT',
        title: 'Yohana 3:16',
      },
    ]);
  });

  it('normalizes comparison results into verse rows for requested versions', () => {
    expect(
      normalizeComparisonResponse(
        {
          book: { name: 'John', osis_id: 'John' },
          chapter: 3,
          results: [
            {
              readings: [
                { text: 'For God so loved the world.', version: 'ASV' },
                { text: 'For God loved the world in this way.', version: 'BSB' },
              ],
              verse_number: 16,
            },
          ],
        },
        ['ASV', 'BSB'],
        'John',
        3,
      ),
    ).toEqual({
      book: 'John',
      chapter: 3,
      versions: ['ASV', 'BSB'],
      verses: [
        {
          readings: [
            { text: 'For God so loved the world.', version: 'ASV' },
            { text: 'For God loved the world in this way.', version: 'BSB' },
          ],
          verseNumber: 16,
        },
      ],
    });
  });
});
