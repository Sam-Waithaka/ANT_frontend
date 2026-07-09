import { describe, expect, it } from 'vitest';
import {
  canAccessWritingStudio,
  canArchiveWriting,
  canCreateWriting,
  canDeleteMedia,
  canEditAnyWriting,
  canEditMedia,
  canEditOwnWriting,
  canManageAssignments,
  canManageTaxonomy,
  canManageWorkflowNotes,
  canPublishWriting,
  canReviewWriting,
  canUploadMedia,
  canViewAnyDrafts,
  canViewOwnDrafts,
  getEditorialWritingCapabilities,
  hasAnyPermission,
  hasPermission,
  MEDIA_PERMISSIONS,
  WRITING_PERMISSIONS,
} from '../../src/utils/permissions';

describe('writing permissions', () => {
  it('checks individual and grouped permission membership', () => {
    const permissions = [
      WRITING_PERMISSIONS.createWriting,
      WRITING_PERMISSIONS.viewOwnDraftWriting,
    ];

    expect(hasPermission(permissions, WRITING_PERMISSIONS.createWriting)).toBe(true);
    expect(hasPermission(permissions, WRITING_PERMISSIONS.publishWriting)).toBe(false);
    expect(hasAnyPermission(permissions, [
      WRITING_PERMISSIONS.publishWriting,
      WRITING_PERMISSIONS.viewOwnDraftWriting,
    ])).toBe(true);
  });

  it('allows studio access from any writing permission only', () => {
    expect(canAccessWritingStudio([WRITING_PERMISSIONS.editOwnWriting])).toBe(true);
    expect(canAccessWritingStudio([MEDIA_PERMISSIONS.addMediaAsset])).toBe(false);
    expect(canAccessWritingStudio([])).toBe(false);
  });

  it('exposes named writing capability helpers', () => {
    const permissions = Object.values(WRITING_PERMISSIONS);

    expect(canCreateWriting(permissions)).toBe(true);
    expect(canViewOwnDrafts(permissions)).toBe(true);
    expect(canViewAnyDrafts(permissions)).toBe(true);
    expect(canEditOwnWriting(permissions)).toBe(true);
    expect(canEditAnyWriting(permissions)).toBe(true);
    expect(canPublishWriting(permissions)).toBe(true);
    expect(canArchiveWriting(permissions)).toBe(true);
    expect(canManageTaxonomy(permissions)).toBe(true);
    expect(canManageAssignments(permissions)).toBe(true);
    expect(canReviewWriting(permissions)).toBe(true);
    expect(canManageWorkflowNotes(permissions)).toBe(true);
  });



  it('derives editorial capabilities from permissions and per-writing ownership', () => {
    const ownWriting = { author_ids: [7], is_author: undefined };
    const user = {
      id: 7,
      permissions: [
        WRITING_PERMISSIONS.editOwnWriting,
        WRITING_PERMISSIONS.reviewWriting,
        WRITING_PERMISSIONS.manageWorkflowNotes,
      ],
    };

    expect(getEditorialWritingCapabilities(user, ownWriting)).toMatchObject({
      canEdit: true,
      canManageNotes: true,
      canReview: true,
      isAuthor: true,
    });
    expect(getEditorialWritingCapabilities({ id: 8, permissions: [WRITING_PERMISSIONS.editOwnWriting] }, ownWriting)).toMatchObject({
      canEdit: false,
      isAuthor: false,
    });
    expect(getEditorialWritingCapabilities({ id: 8, permissions: [WRITING_PERMISSIONS.editAnyWriting] }, ownWriting).canEdit).toBe(true);
  });

  it('exposes named media capability helpers for editor media controls', () => {
    const permissions = Object.values(MEDIA_PERMISSIONS);

    expect(canUploadMedia(permissions)).toBe(true);
    expect(canEditMedia(permissions)).toBe(true);
    expect(canDeleteMedia(permissions)).toBe(true);
  });
});
