import { HandHeart, MessageSquareQuote, Pencil, Target, Trash2, GripVertical } from 'lucide-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, type NodeKey } from 'lexical';
import { useSpecialBlockEditor } from './SpecialBlockEditorContext';
import type { PastoralBlockData, PastoralBlockKind } from './pastoralTypes';

const blockConfig = {
  reflection: { accent: 'border-red-800/70', icon: MessageSquareQuote, label: 'Reflection', surface: 'bg-[#fffaf0] dark:bg-zinc-950', title: 'text-red-800 dark:text-red-200' },
  prayer: { accent: 'border-lime-800/60 dark:border-lime-300/40', icon: HandHeart, label: 'Prayer', surface: 'bg-[#fffaf0] dark:bg-zinc-950', title: 'text-lime-800 dark:text-lime-200' },
  application: { accent: 'border-amber-700/70 dark:border-amber-300/50', icon: Target, label: 'Application', surface: 'bg-[#fffaf0] dark:bg-zinc-950', title: 'text-amber-700 dark:text-amber-200' },
} as const;

const PastoralBlockView = ({ data, kind, nodeKey }: { data: PastoralBlockData; kind: PastoralBlockKind; nodeKey: NodeKey }) => {
  const [editor] = useLexicalComposerContext();
  const { onEditPastoral } = useSpecialBlockEditor();
  const config = blockConfig[kind];
  const Icon = config.icon;
  const editable = editor.isEditable();
  const contentClass = kind === 'prayer' ? 'italic' : '';
  const remove = () => editor.update(() => $getNodeByKey(nodeKey)?.remove());
  const drag = (event: React.DragEvent<HTMLButtonElement>) => { event.dataTransfer.setData('application/x-aic-writing-block', nodeKey); event.dataTransfer.effectAllowed = 'move'; };
  return <section aria-label={`${config.label}${data.title ? `: ${data.title}` : ''}`} className={'group relative my-8 rounded-2xl border border-black/10 px-6 py-6 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:shadow-black/25 sm:px-8 ' + config.surface} contentEditable={false}>{editable ? <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-xl border border-black/10 bg-white/95 p-1 shadow-sm dark:border-white/10 dark:bg-[#171717]/95"><button aria-label={`Drag ${config.label.toLowerCase()} block`} className="grid size-8 cursor-grab place-items-center rounded-lg text-zinc-700 hover:bg-black/5 active:cursor-grabbing dark:text-stone-200 dark:hover:bg-white/10" draggable onDragStart={drag} title={`Drag ${config.label.toLowerCase()} block`} type="button"><GripVertical size={15} /></button><button aria-label={`Edit ${config.label.toLowerCase()} block`} className="grid size-8 place-items-center rounded-lg text-zinc-700 hover:bg-black/5 dark:text-stone-200 dark:hover:bg-white/10" onClick={() => onEditPastoral?.({ data, kind, nodeKey })} title={`Edit ${config.label.toLowerCase()} block`} type="button"><Pencil size={15} /></button><button aria-label={`Remove ${config.label.toLowerCase()} block`} className="grid size-8 place-items-center rounded-lg text-red-800 hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-950/40" onClick={remove} title={`Remove ${config.label.toLowerCase()} block`} type="button"><Trash2 size={15} /></button></div> : null}<div className={'border-l-2 pl-5 ' + config.accent}><p className={'flex items-center gap-2 font-sans text-xs font-black uppercase tracking-[0.18em] ' + config.title}><Icon size={15} /> {config.label}</p>{kind === 'application' && data.title ? <p className={'mt-5 text-xs font-black uppercase tracking-[0.16em] ' + config.title}>{data.title}</p> : null}<p className={'mt-5 whitespace-pre-line font-serif text-2xl leading-10 sm:text-3xl ' + contentClass}>{data.content}</p>{kind !== 'application' && data.authorVoice ? <p className="mt-5 text-sm text-zinc-600 dark:text-stone-300">- {data.authorVoice}</p> : null}</div></section>;
};
export default PastoralBlockView;

