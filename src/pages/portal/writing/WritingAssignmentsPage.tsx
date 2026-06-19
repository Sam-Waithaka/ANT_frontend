import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { createAssignment, deleteAssignment, fetchAssignments } from '../../../services/writingApi';
import type { WritingAssignment } from '../../../types/writing';
import { canManageAssignments } from '../../../utils/permissions';

const assignmentTypes = ['Homepage Feature', 'Project 52', 'Ministry Description', 'Media Summary', 'Event Description'];

const WritingAssignmentsPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [assignments, setAssignments] = useState<WritingAssignment[]>([]);
  const [assignmentType, setAssignmentType] = useState(assignmentTypes[0]);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const allowed = canManageAssignments(auth.permissions);

  const load = () => {
    const controller = new AbortController();
    if (allowed) {
      fetchAssignments(auth.accessToken, controller.signal)
        .then((page) => setAssignments(page.results))
        .catch(() => setMessage('Unable to load assignments right now.'));
    }
    return controller;
  };

  useEffect(() => {
    const controller = load();
    return () => controller.abort();
  }, [allowed, auth.accessToken]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!allowed || !title.trim()) return;

    try {
      await createAssignment(auth.accessToken, {
        assignment_type: assignmentType,
        notes,
        status: 'OPEN',
        title,
      });
      setTitle('');
      setNotes('');
      setMessage('Assignment created.');
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to create assignment.');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteAssignment(auth.accessToken, id);
      setAssignments((current) => current.filter((assignment) => assignment.id !== id));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to delete assignment.');
    }
  };

  return (
    <WritingStudioShell>
      {!allowed ? (
        <p className="rounded-3xl border border-red-900/10 bg-red-950/5 p-6 font-bold text-red-800">Assignment management requires assignment permission.</p>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <form onSubmit={handleCreate} className={`rounded-3xl border p-6 shadow-lg ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Assignments</p>
          <h2 className="mt-3 font-serif text-4xl">Request a writing task</h2>
          <input className={`mt-6 w-full rounded-2xl border px-4 py-3 outline-none ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-[#f8f5ef]'}`} onChange={(event) => setTitle(event.target.value)} placeholder="Assignment title" value={title} />
          <select className={`mt-4 w-full rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`} onChange={(event) => setAssignmentType(event.target.value)} value={assignmentType}>
            {assignmentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <textarea className={`mt-4 min-h-28 w-full rounded-2xl border px-4 py-3 outline-none ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-[#f8f5ef]'}`} onChange={(event) => setNotes(event.target.value)} placeholder="Notes" value={notes} />
          <button className="mt-5 rounded-full bg-red-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-50" disabled={!allowed} type="submit">Create assignment</button>
          {message ? <p className="mt-5 text-sm font-bold text-red-800">{message}</p> : null}
        </form>
        <section className="grid gap-3">
          {assignments.map((assignment) => (
            <article key={assignment.id} className={`rounded-3xl border p-5 shadow-lg ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">{assignment.assignment_type || 'Writing Task'}</p>
                  <h3 className="mt-2 text-xl font-black">{assignment.title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>{assignment.notes || 'No notes added.'}</p>
                </div>
                <button className="rounded-full border border-red-900/20 p-3 text-red-800" onClick={() => void handleDelete(assignment.id)} type="button" aria-label="Delete assignment">
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
          {assignments.length === 0 ? <p className={`rounded-3xl border p-6 text-sm ${darkMode ? 'border-white/10 bg-zinc-950 text-stone-400' : 'border-black/10 bg-white text-zinc-600'}`}>No assignments yet.</p> : null}
        </section>
      </div>
    </WritingStudioShell>
  );
};

export default WritingAssignmentsPage;
