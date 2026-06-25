import { CalendarClock, CalendarDays, ChevronDown, Clock3, Rocket, RotateCcw, Send, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { WritingStatus, WritingWorkflowNote } from '../../../types/writing';

type WritingWorkflowControlsProps = {
  canPublish: boolean;
  canReturnToDraft: boolean;
  canSchedule: boolean;
  canSubmitForReview: boolean;
  canUnschedule: boolean;
  darkMode: boolean;
  onPublish: () => Promise<boolean>;
  onReturnToDraft: (note: string) => Promise<boolean>;
  onSchedule: (scheduledFor: string) => Promise<boolean>;
  onSubmitForReview: (note: string) => Promise<boolean>;
  onUnschedule: () => Promise<boolean>;
  saving: boolean;
  scheduledFor?: string | null;
  status: WritingStatus;
  workflowNotes?: WritingWorkflowNote[];
};

const toLocalDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const toLocalTime = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(11, 16);
};

const toLocalDateTimeValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString();
};

const todayInputValue = () => toLocalDateTimeValue(new Date()).slice(0, 10);

const formatSchedulePreview = (dateValue: string, timeValue: string) => {
  if (!dateValue || !timeValue) return 'Choose a date and time.';
  const nextDate = new Date(`${dateValue}T${timeValue}`);
  if (Number.isNaN(nextDate.getTime())) return 'Choose a valid publication time.';
  return nextDate.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const WritingWorkflowControls = ({
  canPublish,
  canReturnToDraft,
  canSchedule,
  canSubmitForReview,
  canUnschedule,
  darkMode,
  onPublish,
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
  const [scheduleDate, setScheduleDate] = useState(() => toLocalDate(scheduledFor));
  const [scheduleTime, setScheduleTime] = useState(() => toLocalTime(scheduledFor));
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    setScheduleDate(toLocalDate(scheduledFor));
    setScheduleTime(toLocalTime(scheduledFor));
  }, [scheduledFor]);

  const fieldClass = darkMode
    ? 'border-white/10 bg-[#141414] text-stone-100 placeholder:text-stone-600 [color-scheme:dark]'
    : 'border-black/10 bg-[#fffaf0] text-zinc-950 placeholder:text-zinc-400 [color-scheme:light]';
  const cardClass = darkMode
    ? 'border-white/10 bg-white/[0.04] text-stone-100'
    : 'border-red-900/10 bg-[#fffaf0] text-zinc-950';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';
  const quietButtonClass = darkMode
    ? 'border border-white/15 bg-white/5 text-stone-100 hover:bg-white/10'
    : 'border border-black/10 bg-white text-zinc-800 hover:border-red-900/25 hover:bg-red-950/[0.03]';
  const dangerButtonClass = darkMode
    ? 'border border-red-700/30 bg-red-950/10 text-red-300 hover:bg-red-950/20'
    : 'border border-red-900/20 bg-white text-red-800 hover:bg-red-950/5';
  const hasActions = canPublish || canSubmitForReview || canReturnToDraft || canSchedule || canUnschedule;

  const scheduleInstant = useMemo(() => {
    if (!scheduleDate || !scheduleTime) return null;
    const value = new Date(`${scheduleDate}T${scheduleTime}`);
    return Number.isNaN(value.getTime()) ? null : value;
  }, [scheduleDate, scheduleTime]);
  const scheduleIsPast = scheduleInstant ? scheduleInstant.getTime() <= Date.now() : false;
  const scheduleDisabled = saving || !scheduleInstant || scheduleIsPast;

  const submitForReview = async () => {
    if (await onSubmitForReview(note.trim())) setNote('');
  };

  const returnToDraft = async () => {
    if (await onReturnToDraft(note.trim())) setNote('');
  };

  const schedule = async () => {
    if (!scheduleInstant || scheduleIsPast) return;
    await onSchedule(scheduleInstant.toISOString());
  };

  const pickQuickSchedule = (minutesFromNow: number) => {
    const nextDate = new Date(Date.now() + minutesFromNow * 60_000);
    const localValue = toLocalDateTimeValue(nextDate);
    setScheduleDate(localValue.slice(0, 10));
    setScheduleTime(localValue.slice(11, 16));
  };

  return (
    <div>
      {hasActions ? (
        <div className="grid gap-4">
          {(canSubmitForReview || canReturnToDraft) ? (
            <label className="grid gap-2 text-sm font-bold">
              Editorial note <span className={`font-normal ${mutedTextClass}`}>(optional)</span>
              <textarea
                className={`min-h-24 w-full resize-y rounded-2xl border px-4 py-3 text-sm leading-6 outline-none transition focus:ring-2 focus:ring-red-800/25 ${fieldClass}`}
                disabled={saving}
                maxLength={500}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a short note for the editorial trail."
                value={note}
              />
            </label>
          ) : null}

          {canPublish ? (
            <div className={`rounded-[1.35rem] border p-4 ${cardClass}`}>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-red-800 text-white shadow-lg shadow-red-950/20">
                  <Rocket size={17} />
                </span>
                <div>
                  <p className="text-sm font-black">Publish now</p>
                  <p className={`mt-1 text-xs leading-5 ${mutedTextClass}`}>Save the current draft and make it public immediately.</p>
                </div>
              </div>
              <button
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-800 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                onClick={() => void onPublish()}
                type="button"
              >
                <Rocket size={16} /> Publish now
              </button>
            </div>
          ) : null}

          {canSubmitForReview ? (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-800 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
              onClick={() => void submitForReview()}
              type="button"
            >
              <Send size={16} /> Submit for review
            </button>
          ) : null}

          {canReturnToDraft ? (
            <button
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${dangerButtonClass}`}
              disabled={saving}
              onClick={() => void returnToDraft()}
              type="button"
            >
              <RotateCcw size={16} /> Return to draft
            </button>
          ) : null}

          {canSchedule ? (
            <div className={`rounded-[1.35rem] border p-4 ${cardClass}`}>
              <div className="flex items-start gap-3">
                <span className={darkMode ? 'grid size-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-red-300' : 'grid size-10 shrink-0 place-items-center rounded-2xl border border-red-900/10 bg-white text-red-800 shadow-sm'}>
                  <CalendarClock size={17} />
                </span>
                <div>
                  <p className="text-sm font-black">Schedule publication</p>
                  <p className={`mt-1 text-xs leading-5 ${mutedTextClass}`}>Choose the exact local date and time this article should go live.</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  <span className="inline-flex items-center gap-2"><CalendarDays size={15} /> Date</span>
                  <input
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-800/25 ${fieldClass}`}
                    disabled={saving}
                    min={todayInputValue()}
                    onChange={(event) => setScheduleDate(event.target.value)}
                    type="date"
                    value={scheduleDate}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  <span className="inline-flex items-center gap-2"><Clock3 size={15} /> Time</span>
                  <input
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-800/25 ${fieldClass}`}
                    disabled={saving}
                    onChange={(event) => setScheduleTime(event.target.value)}
                    type="time"
                    value={scheduleTime}
                  />
                </label>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button className={`rounded-full px-3 py-2 text-xs font-black transition ${quietButtonClass}`} disabled={saving} onClick={() => pickQuickSchedule(60)} type="button">In 1 hour</button>
                <button className={`rounded-full px-3 py-2 text-xs font-black transition ${quietButtonClass}`} disabled={saving} onClick={() => pickQuickSchedule(24 * 60)} type="button">Tomorrow</button>
                <button className={`rounded-full px-3 py-2 text-xs font-black transition ${quietButtonClass}`} disabled={saving} onClick={() => pickQuickSchedule(7 * 24 * 60)} type="button">Next week</button>
              </div>

              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${darkMode ? 'border-white/10 bg-[#080808]/80' : 'border-black/10 bg-white/70'}`}>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800">Selected time</p>
                <p className="mt-1 font-semibold">{formatSchedulePreview(scheduleDate, scheduleTime)}</p>
                {scheduleIsPast ? <p className="mt-1 text-xs font-bold text-red-700">Choose a future time before scheduling.</p> : null}
              </div>

              <button
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-800 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={scheduleDisabled}
                onClick={() => void schedule()}
                type="button"
              >
                <CalendarClock size={16} /> Schedule publication
              </button>
            </div>
          ) : null}

          {canUnschedule ? (
            <button
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${dangerButtonClass}`}
              disabled={saving}
              onClick={() => void onUnschedule()}
              type="button"
            >
              <X size={16} /> Cancel scheduling
            </button>
          ) : null}
        </div>
      ) : (
        <p className={`text-sm leading-6 ${mutedTextClass}`}>No editorial actions are available for this article right now.</p>
      )}

      {status === 'SCHEDULED' && scheduledFor ? (
        <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${cardClass}`}>
          Scheduled for <span className="font-black">{new Date(scheduledFor).toLocaleString()}</span>.
        </p>
      ) : null}

      {workflowNotes.length ? (
        <div className={`mt-5 border-t pt-5 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <button
            aria-expanded={notesOpen}
            className="flex w-full items-center justify-between gap-3 rounded-2xl px-1 py-2 text-left transition hover:bg-red-950/[0.025]"
            onClick={() => setNotesOpen((current) => !current)}
            type="button"
          >
            <span>
              <span className="block text-xs font-black uppercase tracking-[0.16em] text-red-800">Workflow Notes</span>
              <span className={`mt-1 block text-xs ${mutedTextClass}`}>{workflowNotes.length} editorial {workflowNotes.length === 1 ? 'entry' : 'entries'}</span>
            </span>
            <ChevronDown className={`size-4 transition ${notesOpen ? 'rotate-180' : ''}`} />
          </button>
          {notesOpen ? (
            <div className="mt-3 grid gap-3">
              {workflowNotes.map((item) => (
                <div key={item.id} className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${cardClass}`}>
                  <p className={darkMode ? 'font-black text-stone-200' : 'font-black text-zinc-900'}>{item.action_display}</p>
                  {item.note ? <p className={mutedTextClass}>{item.note}</p> : null}
                  <p className={`mt-1 text-xs ${mutedTextClass}`}>{item.created_by_name} · {new Date(item.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default WritingWorkflowControls;

