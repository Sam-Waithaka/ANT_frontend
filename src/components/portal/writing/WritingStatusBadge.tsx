import type { WritingStatus } from '../../../types/writing';

const statusLabels: Record<WritingStatus, string> = {
  ARCHIVED: 'Archived',
  DRAFT: 'Draft',
  IN_REVIEW: 'In review',
  PUBLISHED: 'Published',
  SCHEDULED: 'Scheduled',
};

type WritingStatusBadgeProps = {
  status?: WritingStatus | string;
};

const WritingStatusBadge = ({ status = 'DRAFT' }: WritingStatusBadgeProps) => (
  <span className="inline-flex rounded-full border border-red-900/10 bg-red-950/[0.04] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-red-800">
    {statusLabels[status as WritingStatus] || status}
  </span>
);

export default WritingStatusBadge;
