import type { ReactNode } from 'react';
import { AlignCenter, AlignLeft, AlignRight, BookOpenText, GripVertical, Image as ImageIcon, Maximize2, Minus, Sparkles, Trash2 } from 'lucide-react';
import { $applyNodeReplacement, $getNodeByKey, DecoratorNode, type LexicalNode, type NodeKey, type SerializedLexicalNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import ResponsiveImage from '../../../../media/ResponsiveImage';
import { useChurchBlockMedia } from './ChurchBlockMediaContext';

export type ChurchBlockKind = 'callout' | 'divider' | 'image' | 'scripture';
export type ImageAlignment = 'center' | 'left' | 'right' | 'wide';

export type ChurchBlockData = {
  alignment?: ImageAlignment;
  altText?: string;
  body?: string;
  caption?: string;
  embedId?: number | string;
  embedRecordId?: number | string;
  embed_id?: string;
  kind: ChurchBlockKind;
  mediaAssetId?: number | string;
  reference?: string;
  title?: string;
};

export type SerializedChurchBlockNode = SerializedLexicalNode & { data: ChurchBlockData; type: 'church-block'; version: 1 };

const defaults: Record<Exclude<ChurchBlockKind, 'image'>, ChurchBlockData> = {
  callout: { body: 'Write a quiet devotional reflection.', kind: 'callout', title: 'Reflection' },
  divider: { kind: 'divider' },
  scripture: { body: 'Add the Scripture text here.', kind: 'scripture', reference: 'Scripture reference' },
};

const imageLayoutClass: Record<ImageAlignment, string> = {
  center: 'mx-auto w-full max-w-2xl',
  left: 'float-left mr-6 w-[min(48%,20rem)]',
  right: 'float-right ml-6 w-[min(48%,20rem)]',
  wide: 'w-full',
};

const ImageLayoutButton = ({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) => (
  <button aria-label={label} className={'grid size-8 place-items-center rounded-lg border transition ' + (active ? 'border-red-200 bg-red-50 text-red-800' : 'border-black/10 bg-white text-zinc-700 hover:bg-black/5')} onClick={onClick} title={label} type="button">{icon}</button>
);

const ChurchBlockView = ({ data, nodeKey }: { data: ChurchBlockData; nodeKey: NodeKey }) => {
  const [editor] = useLexicalComposerContext();
  const asset = useChurchBlockMedia(data.mediaAssetId);
  const editable = editor.isEditable();
  const update = (patch: Partial<ChurchBlockData>) => editor.update(() => {
    const node = $getNodeByKey(nodeKey);
    if ($isChurchBlockNode(node)) node.setData({ ...node.getData(), ...patch });
  });
  const inputClass = 'w-full border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-current/45';

  if (data.kind === 'divider') return <div className="my-8 flex items-center gap-3" contentEditable={false}><Minus size={16} className="text-red-800" /><span className="h-px flex-1 bg-red-900/20" /><Minus size={16} className="text-red-800" /></div>;

  if (data.kind === 'image') {
    const alignment = data.alignment || 'center';
    return (
      <figure className={'group relative my-7 overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#171717] ' + imageLayoutClass[alignment]} contentEditable={false}>
        {editable ? <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-xl border border-black/10 bg-white/95 p-1 shadow-sm">
          <button aria-label="Drag image" className="grid size-8 cursor-grab place-items-center rounded-lg text-zinc-700 hover:bg-black/5 active:cursor-grabbing" draggable onDragStart={(event) => { event.dataTransfer.setData('application/x-aic-writing-image', nodeKey); event.dataTransfer.effectAllowed = 'move'; }} title="Drag image"><GripVertical size={16} /></button>
          <ImageLayoutButton active={alignment === 'left'} icon={<AlignLeft size={15} />} label="Align image left" onClick={() => update({ alignment: 'left' })} />
          <ImageLayoutButton active={alignment === 'center'} icon={<AlignCenter size={15} />} label="Center image" onClick={() => update({ alignment: 'center' })} />
          <ImageLayoutButton active={alignment === 'right'} icon={<AlignRight size={15} />} label="Align image right" onClick={() => update({ alignment: 'right' })} />
          <ImageLayoutButton active={alignment === 'wide'} icon={<Maximize2 size={15} />} label="Make image wide" onClick={() => update({ alignment: 'wide' })} />
          <button aria-label="Remove image block" className="grid size-8 place-items-center rounded-lg text-red-800 hover:bg-red-50" onClick={() => editor.update(() => { const node = $getNodeByKey(nodeKey); if ($isChurchBlockNode(node)) node.remove(); })} title="Remove image block" type="button"><Trash2 size={15} /></button>
        </div> : null}
        {asset?.status === 'ready' ? <ResponsiveImage alt={data.altText || asset.alt_text || asset.title || ''} asset={asset} className="aspect-video w-full object-cover" preset="articleCover" /> : <div className="grid aspect-video place-items-center bg-red-950/[0.03] text-sm text-zinc-600 dark:text-stone-300"><span className="inline-flex items-center gap-2"><ImageIcon size={16} /> {asset?.status === 'failed' ? 'Image processing failed' : 'Preparing image...'}</span></div>}
        <figcaption className="grid gap-2 px-4 py-3 text-sm leading-6 text-zinc-600 dark:text-stone-400">{editable ? <><input aria-label="Image alternative text" className={inputClass} onChange={(event) => update({ altText: event.target.value })} placeholder="Describe this image" value={data.altText || ''} /><input aria-label="Image caption" className={inputClass} onChange={(event) => update({ caption: event.target.value })} placeholder="Add a caption" value={data.caption || ''} /></> : data.caption}</figcaption>
      </figure>
    );
  }

  if (data.kind === 'scripture') return <blockquote className="my-7 border-l-2 border-red-800/60 bg-red-950/[0.035] px-6 py-5" contentEditable={false}><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-red-800"><BookOpenText size={15} /> {editable ? <input aria-label="Scripture reference" className={inputClass} onChange={(event) => update({ reference: event.target.value })} value={data.reference || ''} /> : data.reference}</p>{editable ? <textarea aria-label="Scripture text" className={'mt-4 min-h-24 resize-y font-serif text-xl leading-9 ' + inputClass} onChange={(event) => update({ body: event.target.value })} value={data.body || ''} /> : <p className="mt-4 font-serif text-xl leading-9">{data.body}</p>}</blockquote>;

  return <aside className="my-7 border border-red-900/15 bg-red-950/[0.035] px-6 py-5" contentEditable={false}><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-red-800"><Sparkles size={15} /> {editable ? <input aria-label="Callout title" className={inputClass} onChange={(event) => update({ title: event.target.value })} value={data.title || ''} /> : data.title}</p>{editable ? <textarea aria-label="Callout text" className={'mt-3 min-h-20 resize-y leading-7 ' + inputClass} onChange={(event) => update({ body: event.target.value })} value={data.body || ''} /> : <p className="mt-3 leading-7">{data.body}</p>}</aside>;
};

export class ChurchBlockNode extends DecoratorNode<ReactNode> {
  __data: ChurchBlockData;
  static getType(): string { return 'church-block'; }
  static clone(node: ChurchBlockNode): ChurchBlockNode { return new ChurchBlockNode(node.__data, node.__key); }
  static importJSON(serializedNode: SerializedChurchBlockNode): ChurchBlockNode { return $createChurchBlockNode(serializedNode.data); }
  constructor(data: ChurchBlockData, key?: NodeKey) { super(key); this.__data = data; }
  createDOM(): HTMLElement { return document.createElement('div'); }
  updateDOM(): false { return false; }
  getData(): ChurchBlockData { return this.__data; }
  setData(data: ChurchBlockData): void { this.getWritable().__data = data; }
  exportJSON(): SerializedChurchBlockNode { return { ...super.exportJSON(), data: this.__data, type: 'church-block', version: 1 }; }
  decorate(): ReactNode { return <ChurchBlockView data={this.__data} nodeKey={this.getKey()} />; }
}

export const $createChurchBlockNode = (data: ChurchBlockData) => $applyNodeReplacement(new ChurchBlockNode(data));
export const $createDefaultChurchBlock = (kind: Exclude<ChurchBlockKind, 'image'>) => $createChurchBlockNode(defaults[kind]);
export const $isChurchBlockNode = (node: LexicalNode | null | undefined): node is ChurchBlockNode => node instanceof ChurchBlockNode;



