import type {
  MemorialWorkflowAction,
  MemorialWorkflowFields,
  MemorialWorkflowStatus,
} from '../types/memorial';

export const MEMORIAL_WORKFLOW_STATUSES: MemorialWorkflowStatus[] = [
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
];

export const MEMORIAL_WORKFLOW_ACTIONS: MemorialWorkflowAction[] = [
  'approve',
  'publish',
  'unpublish',
  'archive',
];

const statusLabels: Record<MemorialWorkflowStatus, string> = {
  APPROVED: 'Approved',
  ARCHIVED: 'Archived',
  DRAFT: 'Draft',
  IN_REVIEW: 'In Review',
  PUBLISHED: 'Published',
};

const actionLabels: Record<MemorialWorkflowAction, string> = {
  approve: 'Approve',
  archive: 'Archive',
  publish: 'Publish',
  unpublish: 'Unpublish',
};

export const isMemorialWorkflowStatus = (
  value: unknown,
): value is MemorialWorkflowStatus =>
  typeof value === 'string'
  && MEMORIAL_WORKFLOW_STATUSES.includes(value as MemorialWorkflowStatus);

export const getMemorialStatusLabel = (status: MemorialWorkflowStatus) =>
  statusLabels[status];

export const getMemorialWorkflowActionLabel = (
  action: MemorialWorkflowAction,
) => actionLabels[action];

export const isPublishedMemorialRecord = (
  record: Pick<MemorialWorkflowFields, 'status'>,
) => record.status === 'PUBLISHED';

export const isPubliclyVisibleMemorialRecord = (
  record: Pick<MemorialWorkflowFields, 'is_visible' | 'status'>,
) => record.status === 'PUBLISHED' && record.is_visible;

export const getAvailableMemorialWorkflowActions = (
  status: MemorialWorkflowStatus,
): MemorialWorkflowAction[] => {
  if (status === 'DRAFT' || status === 'IN_REVIEW') {
    return ['approve', 'archive'];
  }

  if (status === 'APPROVED') {
    return ['publish', 'archive'];
  }

  if (status === 'PUBLISHED') {
    return ['unpublish', 'archive'];
  }

  return [];
};
