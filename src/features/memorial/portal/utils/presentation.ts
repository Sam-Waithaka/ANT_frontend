import type { ModerationObject, ModerationWorkspace } from '../types';

export const formatMemorialDateTime = (value?: string | null) => {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi',
  }).format(date);
};

export const statusLabel = (status: ModerationWorkspace['page']['status']) => ({
  draft: 'Draft',
  published: 'Published',
  unpublished: 'Unpublished',
})[status];

export const approvalLabel = (item: ModerationObject) => item.is_approved ? 'Approved' : 'Awaiting approval';

export const workspaceCounts = (workspace: ModerationWorkspace) => {
  const children: ModerationObject[] = [
    ...workspace.tributes,
    ...workspace.milestones,
    ...workspace.service_events,
    ...workspace.media,
  ];
  return {
    awaitingApproval: children.filter((item) => !item.is_approved).length,
    processing: workspace.media.filter((item) => item.processing.code === 'pending' || item.processing.code === 'processing').length,
  };
};

export const emptyContent = { root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 } };

