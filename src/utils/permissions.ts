export const WRITING_PERMISSIONS = {
  archiveWriting: 'writings.archive_writing',
  createWriting: 'writings.create_writing',
  editAnyWriting: 'writings.edit_any_writing',
  editOwnWriting: 'writings.edit_own_writing',
  manageAssignments: 'writings.manage_assignments',
  manageTaxonomy: 'writings.manage_taxonomy',
  publishWriting: 'writings.publish_writing',
  reviewWriting: 'writings.review_writing',
  manageWorkflowNotes: 'writings.manage_workflow_notes',
  viewAnyDraftWriting: 'writings.view_any_draft_writing',
  viewOwnDraftWriting: 'writings.view_own_draft_writing',
} as const;

export const MEDIA_PERMISSIONS = {
  addMediaAsset: 'media_files.add_mediaasset',
  changeMediaAsset: 'media_files.change_mediaasset',
  deleteMediaAsset: 'media_files.delete_mediaasset',
} as const;

export const WRITING_STUDIO_PERMISSIONS = Object.values(WRITING_PERMISSIONS);

export const hasPermission = (permissions: string[], permission: string) => permissions.includes(permission);

export const hasAnyPermission = (permissions: string[], required: string[]) =>
  required.some((permission) => hasPermission(permissions, permission));

export const canAccessWritingStudio = (permissions: string[]) =>
  hasAnyPermission(permissions, WRITING_STUDIO_PERMISSIONS);

export const canCreateWriting = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.createWriting);

export const canViewOwnDrafts = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.viewOwnDraftWriting);

export const canViewAnyDrafts = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.viewAnyDraftWriting);

export const canEditOwnWriting = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.editOwnWriting);

export const canEditAnyWriting = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.editAnyWriting);

export const canPublishWriting = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.publishWriting);

export const canArchiveWriting = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.archiveWriting);

export const canReviewWriting = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.reviewWriting);

export const canManageWorkflowNotes = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.manageWorkflowNotes);

export const canManageTaxonomy = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.manageTaxonomy);

export const canManageAssignments = (permissions: string[]) =>
  hasPermission(permissions, WRITING_PERMISSIONS.manageAssignments);

export const canUploadMedia = (permissions: string[]) =>
  hasPermission(permissions, MEDIA_PERMISSIONS.addMediaAsset);

export const canEditMedia = (permissions: string[]) =>
  hasPermission(permissions, MEDIA_PERMISSIONS.changeMediaAsset);

export const canDeleteMedia = (permissions: string[]) =>
  hasPermission(permissions, MEDIA_PERMISSIONS.deleteMediaAsset);


export type EditorialPermissionUser = {
  id?: number | string;
  permissions?: string[];
};

export type EditorialPermissionWriting = {
  author_ids?: Array<number | string>;
  is_author?: boolean;
};

export const getEditorialWritingCapabilities = (user: EditorialPermissionUser, writing: EditorialPermissionWriting) => {
  const permissions = user.permissions || [];
  const isAuthor = writing.is_author ?? (user.id !== undefined && writing.author_ids?.some((authorId) => String(authorId) === String(user.id))) ?? false;

  return {
    canArchive: canArchiveWriting(permissions),
    canEdit: canEditAnyWriting(permissions) || (isAuthor && canEditOwnWriting(permissions)),
    canManageNotes: canManageWorkflowNotes(permissions),
    canPublish: canPublishWriting(permissions),
    canReview: canReviewWriting(permissions),
    isAuthor,
  };
};
