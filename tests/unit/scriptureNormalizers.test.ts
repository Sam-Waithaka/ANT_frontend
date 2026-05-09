import { describe, expect, it } from 'vitest';
import {
  normalizeAnnotationsResponse,
  normalizeBooksResponse,
  normalizeChapterDetailResponse,
  normalizeChaptersResponse,
  normalizeComparisonResponse,
  normalizePaginatedResponse,
  normalizeSearchResponse,
  normalizeSearchRecordsResponse,
  normalizeToolResponse,
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

  it('normalizes chapter lists from chapter_numbers when chapter objects are absent', () => {
    expect(
      normalizeChaptersResponse({
        chapter_numbers: [1, 2, 3],
      }),
    ).toEqual([
      { id: '1', label: 'Chapter 1', number: 1 },
      { id: '2', label: 'Chapter 2', number: 2 },
      { id: '3', label: 'Chapter 3', number: 3 },
    ]);
  });

  it('normalizes chapter detail with omitted verse markers and license notes', () => {
    expect(
      normalizeChapterDetailResponse({
        credit: {
          license_type: 'Public Domain',
          license_notes: 'Public domain test scripture.',
          source: 'eBible',
          source_url: 'https://example.com/source',
        },
        verses: [
          {
            annotations: [
              {
                annotation_type: 'footnote',
                content: 'Or beginning.',
                end_offset: 12,
                source_marker: 'osis:note',
                start_offset: 12,
              },
            ],
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
        annotations: [
          expect.objectContaining({
            content: 'Or beginning.',
            sourceMarker: 'osis:note',
            startOffset: 12,
            type: 'footnote',
          }),
        ],
        chapterCredit: expect.objectContaining({
          licenseNotes: 'Public domain test scripture.',
          licenseType: 'Public Domain',
          source: 'eBible',
        }),
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

  it('normalizes annotation endpoint responses with offsets and safe public content', () => {
    expect(
      normalizeAnnotationsResponse({
        results: [
          {
            annotation_type: 'footnote',
            anchor_text: 'beginning',
            content: 'Or at first.',
            end_offset: 16,
            raw_content: '<note>Or at first.</note>',
            source_marker: 'osis:note',
            start_offset: 7,
            verse_number: 1,
          },
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        anchorText: 'beginning',
        content: 'Or at first.',
        endOffset: 16,
        rawContent: '<note>Or at first.</note>',
        sourceMarker: 'osis:note',
        startOffset: 7,
        type: 'footnote',
        verseNumber: 1,
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

  it('normalizes paginated Bible tool responses and preserves marker status metadata', () => {
    expect(
      normalizeToolResponse({
        count: 2,
        next: 'https://api.aicnjoro.org/v1/bible/versions/BSB/markers/?page=2',
        previous: null,
        results: [
          {
            reference: 'John 5:4',
            status: 'omitted',
            text: 'Verse marker note.',
          },
        ],
      }),
    ).toEqual({
      count: 2,
      next: 'https://api.aicnjoro.org/v1/bible/versions/BSB/markers/?page=2',
      previous: null,
      results: [
        {
          body: 'Verse marker note.',
          id: 'John 5:4-0',
          meta: 'omitted',
          subtitle: undefined,
          title: 'John 5:4',
        },
      ],
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

  it('normalizes paginated search responses with navigation metadata and result contract', () => {
    expect(
      normalizeSearchResponse({
        count: 2,
        next: 'https://api.aicnjoro.org/v1/bible/search/?page=2',
        previous: null,
        results: [
          {
            all_terms_match: true,
            book: { name: 'Yohana', osis_id: 'John' },
            chapter: 3,
            credit: { license_type: 'Public Domain', source: 'eBible' },
            exact_match: false,
            headline: 'Kwa maana Mungu <mark>aliupenda</mark> ulimwengu.',
            rank: 1,
            reference: 'Yohana 3:16',
            search_type: 'fuzzy',
            similarity: 0.91,
            text: 'Kwa maana Mungu aliupenda ulimwengu.',
            version: 'SWNT',
            verse_number: 16,
          },
        ],
        search_config: 'simple',
        suggestions: [
          {
            term: 'upndo',
            options: [{ term: 'upendo', similarity: 0.82 }],
          },
        ],
      }),
    ).toEqual({
      count: 2,
      next: 'https://api.aicnjoro.org/v1/bible/search/?page=2',
      previous: null,
      results: [
        expect.objectContaining({
          allTermsMatch: true,
          book: { name: 'Yohana', osisId: 'John' },
          chapter: 3,
          credit: expect.objectContaining({ licenseType: 'Public Domain', source: 'eBible' }),
          exactMatch: false,
          headline: 'Kwa maana Mungu <mark>aliupenda</mark> ulimwengu.',
          rank: 1,
          reference: 'Yohana 3:16',
          searchType: 'fuzzy',
          similarity: 0.91,
          text: 'Kwa maana Mungu aliupenda ulimwengu.',
          verseNumber: 16,
          version: 'SWNT',
        }),
      ],
      searchConfig: 'simple',
      suggestions: ['upndo', 'upendo'],
    });
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
            {
              readings: [
                { display: 'Not present in this source', is_present: false, text: '', version: 'ASV' },
                { text: 'An angel went down at a certain season.', version: 'BSB' },
              ],
              verse_number: 4,
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
            { display: 'Not present in this source', isPresent: false, text: '', version: 'ASV' },
            { isPresent: true, text: 'An angel went down at a certain season.', version: 'BSB' },
          ],
          verseNumber: 4,
        },
        {
          readings: [
            { isPresent: true, text: 'For God so loved the world.', version: 'ASV' },
            { isPresent: true, text: 'For God loved the world in this way.', version: 'BSB' },
          ],
          verseNumber: 16,
        },
      ],
    });
  });
});
