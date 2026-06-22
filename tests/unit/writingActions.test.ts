import { describe, expect, it } from 'vitest';
import { WRITING_PERMISSIONS } from '../../src/utils/permissions';
import { getWritingPublishingActions } from '../../src/utils/writingActions';

describe('writing publishing actions', () => {
  it('requires both permission and a publishable status before showing Publish', () => {
    expect(getWritingPublishingActions([WRITING_PERMISSIONS.publishWriting], 'DRAFT')).toMatchObject({
      canPublish: true,
    });
    expect(getWritingPublishingActions([WRITING_PERMISSIONS.publishWriting], 'PUBLISHED')).toMatchObject({
      canPublish: false,
    });
    expect(getWritingPublishingActions([], 'DRAFT')).toMatchObject({
      canPublish: false,
    });
  });

  it('shows Archive only to permitted users and never for archived writings', () => {
    expect(getWritingPublishingActions([WRITING_PERMISSIONS.archiveWriting], 'PUBLISHED')).toMatchObject({
      canArchive: true,
    });
    expect(getWritingPublishingActions([WRITING_PERMISSIONS.archiveWriting], 'ARCHIVED')).toMatchObject({
      canArchive: false,
    });
  });
});
