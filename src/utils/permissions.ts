export const WRITING_PERMISSIONS = {
  archiveWriting: 'writings.archive_writing',
  createWriting: 'writings.create_writing',
  editAnyWriting: 'writings.edit_any_writing',
  editOwnWriting: 'writings.edit_own_writing',
  manageAssignments: 'writings.manage_assignments',
  manageTaxonomy: 'writings.manage_taxonomy',
  publishWriting: 'writings.publish_writing',
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
