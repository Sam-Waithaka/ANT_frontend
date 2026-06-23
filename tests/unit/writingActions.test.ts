import { describe, expect, it } from 'vitest';
import { WRITING_PERMISSIONS } from '../../src/utils/permissions';
import { getWritingPublishingActions, getWritingWorkflowActions } from '../../src/utils/writingActions';

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

describe('writing workflow actions', () => {
  it('exposes only the signed-off transition for each status and capability', () => {
    expect(getWritingWorkflowActions([WRITING_PERMISSIONS.editOwnWriting], 'DRAFT')).toMatchObject({
      canSubmitForReview: true,
      canSchedule: false,
    });
    expect(getWritingWorkflowActions([WRITING_PERMISSIONS.editAnyWriting, WRITING_PERMISSIONS.publishWriting], 'IN_REVIEW')).toMatchObject({
      canReturnToDraft: true,
      canSchedule: true,
      canSubmitForReview: false,
    });
    expect(getWritingWorkflowActions([WRITING_PERMISSIONS.publishWriting], 'SCHEDULED')).toMatchObject({
      canUnschedule: true,
      canSchedule: false,
    });
  });

  it('never offers workflow mutations for published writings', () => {
    expect(getWritingWorkflowActions(Object.values(WRITING_PERMISSIONS), 'PUBLISHED')).toEqual({
      canReturnToDraft: false,
      canSchedule: false,
      canSubmitForReview: false,
      canUnschedule: false,
    });
  });
});
