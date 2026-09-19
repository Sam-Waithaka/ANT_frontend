import { ArrowDown, ArrowUp, CheckCircle2, PencilLine, RotateCcw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortalToast } from '../../../../components/portal/PortalToast';
import { useAuth } from '../../../../hooks/useAuth';
import { deleteMemorialChild, setMemorialChildApproval, updateMemorialChild } from '../api/memorialPortalApi';
import { useMemorialPortal } from '../hooks/useMemorialPortal';
import type { ChildType, CrudCapability, ModerationObject } from '../types';
import { MemorialButton } from './MemorialUi';

type ChildActionsProps = {
  capability: CrudCapability;
  item: ModerationObject;
  items: ModerationObject[];
  type: Exclude<ChildType, 'media'>;
};

const writingType = (type: Exclude<ChildType, 'media'>) => type === 'service_event' ? 'service_event' : type;

const ChildActions = ({ capability, item, items, type }: ChildActionsProps) => {
  const { accessToken } = useAuth();
  const toast = usePortalToast();
  const { moderation, refreshModeration, refreshWriteups, routes, slug } = useMemorialPortal();
  const published = moderation?.page.status === 'published';
  const sorted = [...items].sort((left, right) => left.position - right.position || Number(left.id) - Number(right.id));
  const index = sorted.findIndex((candidate) => candidate.id === item.id);

  const mutate = async (operation: () => Promise<unknown>, success: string) => {
    try {
      await operation();
      await Promise.all([refreshModeration(), refreshWriteups()]);
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The memorial item could not be updated.');
    }
  };

  const move = async (direction: -1 | 1) => {
    const neighbor = sorted[index + direction];
    if (!neighbor) return;
    if (item.is_approved && !window.confirm('Reordering this approved item will clear its approval. Continue?')) return;
    await mutate(async () => {
      await updateMemorialChild(accessToken, slug, type, item.id, { expected_updated_at: item.updated_at, position: neighbor.position });
      await updateMemorialChild(accessToken, slug, type, neighbor.id, { expected_updated_at: neighbor.updated_at, position: item.position });
    }, 'Order updated. Changed approved items now need approval again.');
  };

  return (
    <div className="flex flex-wrap gap-2">
      {capability.change && !published ? <Link className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8cbbd] px-4 py-2 text-xs font-black dark:border-white/10" to={`${routes.writing}?writeup=${writingType(type)}:${item.id}`}><PencilLine size={14} /> Edit writing</Link> : null}
      {capability.change && !published ? <button aria-label="Move up" className="grid size-10 place-items-center rounded-full border border-[#d8cbbd] disabled:opacity-30 dark:border-white/10" disabled={index <= 0} onClick={() => void move(-1)} type="button"><ArrowUp size={15} /></button> : null}
      {capability.change && !published ? <button aria-label="Move down" className="grid size-10 place-items-center rounded-full border border-[#d8cbbd] disabled:opacity-30 dark:border-white/10" disabled={index < 0 || index >= sorted.length - 1} onClick={() => void move(1)} type="button"><ArrowDown size={15} /></button> : null}
      {capability.approve && !published ? <MemorialButton onClick={() => void mutate(() => setMemorialChildApproval(accessToken, slug, type, item.id, !item.is_approved, item.updated_at), item.is_approved ? 'Approval revoked.' : 'Item approved.')} tone="secondary" type="button">{item.is_approved ? <><RotateCcw size={14} /> Revoke</> : <><CheckCircle2 size={14} /> Approve</>}</MemorialButton> : null}
      {capability.delete && !published ? <MemorialButton onClick={() => { if (window.confirm('Remove this memorial item? This cannot be undone.')) void mutate(() => deleteMemorialChild(accessToken, slug, type, item.id, item.updated_at), 'Memorial item removed.'); }} tone="danger" type="button"><Trash2 size={14} /> Delete</MemorialButton> : null}
    </div>
  );
};

export default ChildActions;
