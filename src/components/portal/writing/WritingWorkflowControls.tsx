import { CalendarClock, RotateCcw, Send, X } from 'lucide-react';
import { useState } from 'react';
import type { WritingStatus, WritingWorkflowNote } from '../../../types/writing';

type WritingWorkflowControlsProps = {
  canReturnToDraft: boolean;
  canSchedule: boolean;
  canSubmitForReview: boolean;
  canUnschedule: boolean;
  darkMode: boolean;
  onReturnToDraft: (note: string) => Promise<boolean>;
  onSchedule: (scheduledFor: string) => Promise<boolean>;
  onSubmitForReview: (note: string) => Promise<boolean>;
  onUnschedule: () => Promise<boolean>;
  saving: boolean;
  scheduledFor?: string | null;
  status: WritingStatus;
  workflowNotes?: WritingWorkflowNote[];
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const WritingWorkflowControls = ({
  canReturnToDraft,
  canSchedule,
  canSubmitForReview,
  canUnschedule,
  darkMode,
  onReturnToDraft,
  onSchedule,
  onSubmitForReview,
  onUnschedule,
  saving,
  scheduledFor,
  status,
  workflowNotes = [],
}: WritingWorkflowControlsProps) => {
  const [note, setNote] = useState('');
  const [scheduleAt, setScheduleAt] = useState(() => toDateTimeLocal(scheduledFor));
  const fieldClass = darkMode ? 'border-white/10 bg-[#171717] text-stone-100' : 'border-black/10 bg-[#fffaf0] text-zinc-950';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';
  const hasActions = canSubmitForReview || canReturnToDraft || canSchedule || canUnschedule;

  const submitForReview = async () => {
    if (await onSubmitForReview(note.trim())) setNote('');
  };
  const returnToDraft = async () => {
    if (await onReturnToDraft(note.trim())) setNote('');
  };
  const schedule = async () => {
    if (!scheduleAt) return;
    await onSchedule(new Date(scheduleAt).toISOString());
  };

  return (
    <section className={'mt-6 border-t pt-5 ' + (darkMode ? 'border-white/10' : 'border-black/10')}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800">Editorial Workflow</p>
      {hasActions ? (
        <div className="mt-4 grid gap-3">
          {(canSubmitForReview || canReturnToDraft) ? (
            <label className="grid gap-2 text-sm font-bold">
              Editorial note <span className={'font-normal ' + mutedTextClass}>(optional)</span>
              <textarea className={'min-h-24 w-full resize-y rounded-2xl border px-4 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-red-800/30 ' + fieldClass} disabled={saving} maxLength={500} onChange={(event) => setNote(event.target.value)} value={note} />
            </label>
          ) : null}
          {canSubmitForReview ? <button className="inline-flex items-center justify-center gap-2 rounded-full bg-red-800 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:opacity-60" disabled={saving} onClick={() => void submitForReview()} type="button"><Send size={16} /> Submit for review</button> : null}
          {canReturnToDraft ? <button className="inline-flex items-center justify-center gap-2 rounded-full border border-red-900/20 px-4 py-3 text-sm font-black text-red-800 disabled:opacity-60" disabled={saving} onClick={() => void returnToDraft()} type="button"><RotateCcw size={16} /> Return to draft</button> : null}
          {canSchedule ? (
            <>
              <label className="grid gap-2 text-sm font-bold">Publish at
                <input className={'w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-800/30 ' + fieldClass} disabled={saving} min={toDateTimeLocal(new Date().toISOString())} onChange={(event) => setScheduleAt(event.target.value)} type="datetime-local" value={scheduleAt} />
              </label>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-red-800 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:opacity-60" disabled={saving || !scheduleAt} onClick={() => void schedule()} type="button"><CalendarClock size={16} /> Schedule publication</button>
            </>
          ) : null}
          {canUnschedule ? <button className="inline-flex items-center justify-center gap-2 rounded-full border border-red-900/20 px-4 py-3 text-sm font-black text-red-800 disabled:opacity-60" disabled={saving} onClick={() => void onUnschedule()} type="button"><X size={16} /> Cancel scheduling</button> : null}
        </div>
      ) : null}
      {status === 'SCHEDULED' && scheduledFor ? <p className={'mt-4 text-sm leading-6 ' + mutedTextClass}>Scheduled for {new Date(scheduledFor).toLocaleString()}.</p> : null}
      {workflowNotes.length ? <div className={'mt-5 grid gap-3 border-t pt-5 ' + (darkMode ? 'border-white/10' : 'border-black/10')}><p className="text-xs font-black uppercase tracking-[0.16em] text-red-800">Workflow Notes</p>{workflowNotes.map((item) => <div key={item.id} className={'text-sm leading-6 ' + mutedTextClass}><p className={darkMode ? 'font-black text-stone-200' : 'font-black text-zinc-900'}>{item.action_display}</p>{item.note ? <p>{item.note}</p> : null}<p className="mt-1 text-xs">{item.created_by_name} · {new Date(item.created_at).toLocaleString()}</p></div>)}</div> : null}
    </section>
  );
};

export default WritingWorkflowControls;
