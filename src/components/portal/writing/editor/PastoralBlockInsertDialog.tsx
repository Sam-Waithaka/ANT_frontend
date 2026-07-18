import { HandHeart, MessageSquareQuote, Quote, Target, X } from 'lucide-react';
import { useState } from 'react';
import type { BlockQuoteData } from '../../../writing/editor/nodes/EditableBlockQuoteNode';
import type { PastoralBlockData, PastoralBlockKind } from '../../../writing/editor/nodes/pastoralTypes';

export type SpecialContentKind = PastoralBlockKind | 'quotation';
type SpecialContentData = PastoralBlockData | BlockQuoteData;
type PastoralBlockInsertDialogProps = {
  darkMode: boolean;
  initialData?: SpecialContentData;
  initialKind?: SpecialContentKind;
  onClose: () => void;
  onInsert: (kind: SpecialContentKind, data: SpecialContentData) => void;
};

const tabs = [
  { kind: 'reflection', label: 'Reflection', subtitle: 'Set apart the reflection', icon: MessageSquareQuote },
  { kind: 'prayer', label: 'Prayer', subtitle: 'Set apart the prayer', icon: HandHeart },
  { kind: 'application', label: 'Application', subtitle: 'Set apart the application', icon: Target },
  { kind: 'quotation', label: 'Quotation', subtitle: 'Set apart a trusted voice', icon: Quote },
] as const;

const isQuotation = (kind: SpecialContentKind): kind is 'quotation' => kind === 'quotation';
const quoteData = (data?: SpecialContentData): BlockQuoteData => data && ('attribution' in data || 'context' in data) ? data : { content: '' };
const pastoralData = (data?: SpecialContentData): PastoralBlockData => data && ('authorVoice' in data || 'title' in data) ? data : { content: '' };

const PastoralBlockInsertDialog = ({ darkMode, initialData, initialKind = 'reflection', onClose, onInsert }: PastoralBlockInsertDialogProps) => {
  const [kind, setKind] = useState<SpecialContentKind>(initialKind);
  const [title, setTitle] = useState(() => isQuotation(initialKind) ? quoteData(initialData).context || '' : pastoralData(initialData).title || '');
  const [authorVoice, setAuthorVoice] = useState(() => pastoralData(initialData).authorVoice || '');
  const [attribution, setAttribution] = useState(() => quoteData(initialData).attribution || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [error, setError] = useState('');
  const active = tabs.find((tab) => tab.kind === kind)!;
  const Icon = active.icon;
  const inputClass = darkMode ? 'w-full rounded-xl border border-white/10 bg-[#080808] px-3 py-2 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30' : 'w-full rounded-xl border border-black/10 bg-[#fffaf0] px-3 py-2 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
  const surfaceClass = darkMode ? 'border-white/10 bg-[#171717] text-stone-100' : 'border-black/10 bg-white text-zinc-950';
  const resetFor = (next: SpecialContentKind) => { setKind(next); setTitle(''); setAuthorVoice(''); setAttribution(''); setContent(''); setError(''); };
  const insert = () => {
    if (!content.trim()) { setError(`${active.label} text is required.`); return; }
    if (isQuotation(kind)) { onInsert(kind, { attribution: attribution.trim() || undefined, content: content.trim(), context: title.trim() || undefined }); return; }
    onInsert(kind, { authorVoice: kind === 'reflection' ? authorVoice.trim() || undefined : undefined, content: content.trim(), title: title.trim() || undefined });
  };
  const titlePlaceholder = kind === 'quotation' ? 'From a sermon, On prayer, or another helpful context' : kind === 'reflection' ? 'Pastoral Reflection' : kind === 'prayer' ? 'Closing Prayer' : 'For This Week';
  const bodyLabel = kind === 'quotation' ? 'Quote text' : kind === 'prayer' ? 'Prayer' : kind === 'application' ? 'Application' : 'Reflection';
  const bodyPlaceholder = kind === 'quotation' ? 'To be loved but not known is comforting but superficial...' : kind === 'prayer' ? 'Lord, teach us to treasure Your Word and obey it with joyful hearts.\n\nAmen.' : kind === 'application' ? 'Read Psalm 119 every morning...' : 'God is most glorified in us when we are most satisfied in Him.';

  return <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-4 sm:place-items-center" role="dialog">
    <section aria-labelledby="pastoral-block-dialog-title" className={'w-full max-w-2xl rounded-2xl border p-5 shadow-2xl sm:p-6 ' + surfaceClass}>
      <header className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-full bg-red-950/[0.06] text-red-800 dark:bg-red-950/30 dark:text-red-200"><Icon size={20} /></span><div><p className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200">Insert {active.label}</p><h2 className="mt-1 font-serif text-2xl" id="pastoral-block-dialog-title">{active.subtitle}</h2></div></div><button aria-label="Close pastoral block dialog" className="grid size-10 place-items-center rounded-full border border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10" onClick={onClose} type="button"><X size={18} /></button></header>
      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-black/10 dark:border-white/10">{tabs.map((tab) => <button className={'border-b-2 px-4 py-3 text-sm font-bold transition ' + (kind === tab.kind ? 'border-red-800 text-red-800 dark:text-red-200' : 'border-transparent text-zinc-600 hover:text-zinc-950 dark:text-stone-400 dark:hover:text-stone-100')} key={tab.kind} onClick={() => resetFor(tab.kind)} type="button">{tab.label}</button>)}</div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1 text-xs font-bold">{kind === 'quotation' ? 'Title or context' : 'Title'} <span className="font-normal text-zinc-500 dark:text-stone-400">(optional)</span><input className={inputClass} onChange={(event) => setTitle(event.target.value)} placeholder={titlePlaceholder} value={title} /></label>{kind === 'quotation' ? <label className="grid gap-1 text-xs font-bold">Quoted owner or attribution <span className="font-normal text-zinc-500 dark:text-stone-400">(optional)</span><input className={inputClass} onChange={(event) => setAttribution(event.target.value)} placeholder="Tim Keller, C.S. Lewis, A.I.C Njoro Town" value={attribution} /></label> : kind === 'reflection' ? <label className="grid gap-1 text-xs font-bold">Author voice <span className="font-normal text-zinc-500 dark:text-stone-400">(optional)</span><input className={inputClass} onChange={(event) => setAuthorVoice(event.target.value)} placeholder="Pastoral Reflection" value={authorVoice} /></label> : <div />}</div>
      <label className="mt-4 grid gap-1 text-xs font-bold">{bodyLabel}<textarea className={inputClass + ' mt-1 min-h-36 resize-y leading-7'} maxLength={kind === 'quotation' ? 1000 : 500} onChange={(event) => setContent(event.target.value)} placeholder={bodyPlaceholder} value={content} /><span className="text-right font-normal text-zinc-500 dark:text-stone-400">{content.length} / {kind === 'quotation' ? 1000 : 500}</span></label>
      {error ? <p className="text-sm text-red-800 dark:text-red-200">{error}</p> : null}
      <footer className="mt-5 flex justify-end gap-3 border-t border-black/10 pt-4 dark:border-white/10"><button className="rounded-full px-4 py-2 text-sm font-bold" onClick={onClose} type="button">Cancel</button><button className="inline-flex items-center gap-2 rounded-full bg-red-800 px-5 py-2 text-sm font-bold text-white" onClick={insert} type="button"><Icon size={16} /> Insert {active.label}</button></footer>
    </section>
  </div>;
};
export default PastoralBlockInsertDialog;
