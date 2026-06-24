import type { ReactNode } from 'react';
import { GripVertical, Pencil, Quote, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $applyNodeReplacement, $getNodeByKey, DecoratorNode, type NodeKey, type SerializedLexicalNode } from 'lexical';

export type BlockQuoteData = { content: string; };
export type SerializedEditableBlockQuoteNode = SerializedLexicalNode & { data: BlockQuoteData; type: 'editorial-blockquote'; version: 1; };

const EditableBlockQuoteView = ({ data, nodeKey }: { data: BlockQuoteData; nodeKey: NodeKey }) => {
  const [editor] = useLexicalComposerContext();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(data.content);
  const editable = editor.isEditable();
  const remove = () => editor.update(() => $getNodeByKey(nodeKey)?.remove());
  const save = () => { editor.update(() => { const node = $getNodeByKey(nodeKey); if (node instanceof EditableBlockQuoteNode) node.setData({ content: content.trim() }); }); setEditing(false); };
  const drag = (event: React.DragEvent<HTMLButtonElement>) => { event.dataTransfer.setData('application/x-aic-writing-block', nodeKey); event.dataTransfer.effectAllowed = 'move'; };
  return <blockquote className="group relative my-7 border-l-2 border-red-800/60 bg-red-950/[0.035] px-6 py-5 font-serif text-xl leading-9 dark:bg-red-950/15" contentEditable={false}>{editable ? <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-xl border border-black/10 bg-white/95 p-1 font-sans shadow-sm dark:border-white/10 dark:bg-[#171717]/95"><button aria-label="Drag blockquote" className="grid size-8 cursor-grab place-items-center rounded-lg text-zinc-700 hover:bg-black/5 active:cursor-grabbing dark:text-stone-200 dark:hover:bg-white/10" draggable onDragStart={drag} title="Drag blockquote" type="button"><GripVertical size={15} /></button><button aria-label="Edit blockquote" className="grid size-8 place-items-center rounded-lg text-zinc-700 hover:bg-black/5 dark:text-stone-200 dark:hover:bg-white/10" onClick={() => setEditing(true)} title="Edit blockquote" type="button"><Pencil size={15} /></button><button aria-label="Remove blockquote" className="grid size-8 place-items-center rounded-lg text-red-800 hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-950/40" onClick={remove} title="Remove blockquote" type="button"><Trash2 size={15} /></button></div> : null}<p className="mb-3 flex items-center gap-2 font-sans text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200"><Quote size={15} /> Quotation</p>{editing ? <div className="grid gap-3 font-sans"><textarea aria-label="Blockquote text" className="min-h-28 w-full resize-y rounded-xl border border-black/10 bg-white p-3 text-base leading-7 text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30 dark:border-white/10 dark:bg-[#080808] dark:text-stone-100" onChange={(event) => setContent(event.target.value)} value={content} /><div className="flex justify-end gap-2"><button className="rounded-full px-3 py-2 text-xs font-bold" onClick={() => { setContent(data.content); setEditing(false); }} type="button">Cancel</button><button className="rounded-full bg-red-800 px-4 py-2 text-xs font-bold text-white" onClick={save} type="button">Save quote</button></div></div> : <p className="whitespace-pre-line">{data.content}</p>}</blockquote>;
};

export class EditableBlockQuoteNode extends DecoratorNode<ReactNode> {
  __data: BlockQuoteData;
  static getType(): string { return 'editorial-blockquote'; }
  static clone(node: EditableBlockQuoteNode): EditableBlockQuoteNode { return new EditableBlockQuoteNode(node.__data, node.__key); }
  static importJSON(serialized: SerializedEditableBlockQuoteNode): EditableBlockQuoteNode { return $createEditableBlockQuoteNode(serialized.data); }
  constructor(data: BlockQuoteData, key?: NodeKey) { super(key); this.__data = data; }
  createDOM(): HTMLElement { return document.createElement('div'); }
  updateDOM(): false { return false; }
  getData(): BlockQuoteData { return this.__data; }
  setData(data: BlockQuoteData): void { this.getWritable().__data = data; }
  exportJSON(): SerializedEditableBlockQuoteNode { return { ...super.exportJSON(), data: this.__data, type: 'editorial-blockquote', version: 1 }; }
  decorate(): ReactNode { return <EditableBlockQuoteView data={this.__data} nodeKey={this.getKey()} />; }
}
export const $createEditableBlockQuoteNode = (data: BlockQuoteData) => $applyNodeReplacement(new EditableBlockQuoteNode(data));
