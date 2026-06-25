import type { WritingStatus } from '../types/writing';
import { canArchiveWriting, canEditAnyWriting, canEditOwnWriting, canPublishWriting } from './permissions';

const publishableStatuses: WritingStatus[] = ['DRAFT', 'IN_REVIEW', 'SCHEDULED'];

export const getWritingPublishingActions = (permissions: string[], status: WritingStatus) => ({
  canArchive: canArchiveWriting(permissions) && status !== 'ARCHIVED',
  canPublish: canPublishWriting(permissions) && publishableStatuses.includes(status),
});

export const getWritingWorkflowActions = (permissions: string[], status: WritingStatus) => ({
  canPublish: canPublishWriting(permissions) && publishableStatuses.includes(status),
  canReturnToDraft: canEditAnyWriting(permissions) && status === 'IN_REVIEW',
  canSchedule: canPublishWriting(permissions) && ['DRAFT', 'IN_REVIEW'].includes(status),
  canSubmitForReview: (canEditOwnWriting(permissions) || canEditAnyWriting(permissions)) && status === 'DRAFT',
  canUnschedule: canPublishWriting(permissions) && status === 'SCHEDULED',
});


