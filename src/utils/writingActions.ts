import type { WritingStatus } from '../types/writing';
import { canArchiveWriting, canPublishWriting } from './permissions';

const publishableStatuses: WritingStatus[] = ['DRAFT', 'IN_REVIEW', 'SCHEDULED'];

export const getWritingPublishingActions = (permissions: string[], status: WritingStatus) => ({
  canArchive: canArchiveWriting(permissions) && status !== 'ARCHIVED',
  canPublish: canPublishWriting(permissions) && publishableStatuses.includes(status),
});