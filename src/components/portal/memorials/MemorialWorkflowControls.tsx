import { useState } from 'react';
import {
  runMemorialWorkflowAction,
  type MemorialWorkflowResource,
} from '../../../services/memorialApi';
import type {
  MemorialId,
  MemorialWorkflowAction,
  MemorialWorkflowFields,
  MemorialWorkflowStatus,
} from '../../../types/memorial';
import {
  getAvailableMemorialWorkflowActions,
  getMemorialStatusLabel,
  getMemorialWorkflowActionLabel,
} from '../../../utils/memorialWorkflow';
import { useAuth } from '../../../hooks/useAuth';
import { usePortalToast } from '../PortalToast';

export type MemorialWorkflowRecord = Pick<
  MemorialWorkflowFields,
  'is_visible' | 'status'
> & {
  id: MemorialId;
};

type MemorialWorkflowStatusBadgeProps = {
  darkMode: boolean;
  status?: MemorialWorkflowStatus;
};

type MemorialWorkflowControlsProps<TRecord extends MemorialWorkflowRecord> = {
  className?: string;
  darkMode: boolean;
  disabled?: boolean;
  onRecordUpdated: (record: TRecord) => void;
  record: TRecord;
  resource: MemorialWorkflowResource;
  showStatus?: boolean;
};

const statusClass = (status: MemorialWorkflowStatus, darkMode: boolean) => {
  if (status === 'PUBLISHED') {
    return darkMode
      ? 'border-emerald-400/20 bg-emerald-950/30 text-emerald-200'
      : 'border-emerald-800/15 bg-emerald-50 text-emerald-800';
  }

  if (status === 'ARCHIVED') {
    return darkMode
      ? 'border-white/10 bg-white/5 text-stone-300'
      : 'border-black/10 bg-zinc-100 text-zinc-700';
  }

  if (status === 'APPROVED') {
    return darkMode
      ? 'border-sky-400/20 bg-sky-950/25 text-sky-200'
      : 'border-sky-800/15 bg-sky-50 text-sky-800';
  }

  return 'border-red-900/15 bg-red-950/[0.04] text-red-800 dark:border-red-200/20 dark:bg-red-950/25 dark:text-red-100';
};

export const MemorialWorkflowStatusBadge = ({
  darkMode,
  status,
}: MemorialWorkflowStatusBadgeProps) => {
  if (!status) return null;

  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-3 text-[0.68rem] font-black uppercase tracking-[0.14em] ${statusClass(status, darkMode)}`}>
      {getMemorialStatusLabel(status)}
    </span>
  );
};

const actionClass = (darkMode: boolean, destructive: boolean) => {
  if (destructive) {
    return darkMode
      ? 'border-red-200/20 text-red-100 hover:bg-red-950/35'
      : 'border-red-900/20 text-red-800 hover:bg-red-950/5';
  }

  return darkMode
    ? 'border-red-200/20 text-red-100 hover:bg-white/10'
    : 'border-red-900/20 text-red-800 hover:bg-red-950/5';
};

const isDestructiveAction = (action: MemorialWorkflowAction) =>
  action === 'archive' || action === 'unpublish';

function MemorialWorkflowControls<TRecord extends MemorialWorkflowRecord>({
  className = '',
  darkMode,
  disabled = false,
  onRecordUpdated,
  record,
  resource,
  showStatus = true,
}: MemorialWorkflowControlsProps<TRecord>) {
  const auth = useAuth();
  const toast = usePortalToast();
  const [pendingAction, setPendingAction] = useState<MemorialWorkflowAction | null>(null);
  const actions = getAvailableMemorialWorkflowActions(record.status);

  const runAction = async (action: MemorialWorkflowAction) => {
    setPendingAction(action);
    try {
      const updated = await runMemorialWorkflowAction<TRecord>(
        auth.accessToken,
        resource,
        record.id,
        action,
      );
      onRecordUpdated(updated);
      toast.success(`${getMemorialWorkflowActionLabel(action)} complete.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Workflow action failed.');
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-2 ${className}`}>
      {showStatus ? (
        <MemorialWorkflowStatusBadge darkMode={darkMode} status={record.status} />
      ) : null}
      {actions.map((action) => (
        <button
          className={`inline-flex min-h-9 items-center justify-center rounded-full border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${actionClass(darkMode, isDestructiveAction(action))}`}
          disabled={disabled || pendingAction !== null}
          key={action}
          onClick={() => void runAction(action)}
          type="button"
        >
          {pendingAction === action ? 'Working...' : getMemorialWorkflowActionLabel(action)}
        </button>
      ))}
    </div>
  );
}

export default MemorialWorkflowControls;
