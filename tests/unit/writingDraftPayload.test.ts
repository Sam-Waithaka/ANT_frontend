import { describe, expect, it } from 'vitest';
import { buildWritingDraftPayload } from '../../src/utils/writingDraftPayload';

const fields = {
  content_json: { root: { children: [], type: 'root', version: 1 } },
  title: 'A draft',
};

describe('buildWritingDraftPayload', () => {
  it('omits an untouched cover image from an ordinary autosave', () => {
    expect(buildWritingDraftPayload(fields, undefined)).not.toHaveProperty('og_image');
  });

  it('sends the selected asset id and only sends null for an intentional removal', () => {
    expect(buildWritingDraftPayload(fields, 8)).toMatchObject({ og_image: 8 });
    expect(buildWritingDraftPayload(fields, null)).toMatchObject({ og_image: null });
  });
});
