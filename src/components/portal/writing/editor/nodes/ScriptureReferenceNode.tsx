import type { ReactNode } from 'react';
import { useState } from 'react';
import { $applyNodeReplacement, DecoratorNode, type LexicalNode, type NodeKey, type SerializedLexicalNode } from 'lexical';
import type { ScriptureData } from './scriptureTypes';

export type SerializedScriptureReferenceNode = SerializedLexicalNode & { data: ScriptureData; type: 'scripture-reference'; version: 1; };

const ScriptureReferenceView = ({ data }: { data: ScriptureData }) => {
  const [open, setOpen] = useState(false);
  return <span className="relative inline"><button aria-expanded={open} aria-label={`View Scripture reference ${data.reference}`} className="inline rounded-sm text-inherit text-red-800 underline-offset-2 transition hover:underline focus:outline-none focus:ring-2 focus:ring-red-800/30 dark:text-red-200" onBlur={() => setOpen(false)} onClick={() => setOpen((current) => !current)} onFocus={() => setOpen(true)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} type="button">{data.reference}</button>{open ? <span className="fixed inset-x-4 bottom-4 z-30 block rounded-2xl border border-black/10 bg-white p-4 text-left text-zinc-950 shadow-xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-7 sm:w-80 dark:border-white/10 dark:bg-zinc-950 dark:text-stone-100" role="dialog"><span className="block text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">{data.reference} {data.version ? `· ${data.version}` : ''}</span><span className="mt-3 block font-serif text-base leading-7">{data.text}</span></span> : null}</span>;
};

export class ScriptureReferenceNode extends DecoratorNode<ReactNode> {
  __data: ScriptureData;
  static getType(): string { return 'scripture-reference'; }
  static clone(node: ScriptureReferenceNode): ScriptureReferenceNode { return new ScriptureReferenceNode(node.__data, node.__key); }
  static importJSON(serializedNode: SerializedScriptureReferenceNode): ScriptureReferenceNode { return $createScriptureReferenceNode(serializedNode.data); }
  constructor(data: ScriptureData, key?: NodeKey) { super(key); this.__data = data; }
  createDOM(): HTMLElement { return document.createElement('span'); }
  updateDOM(): false { return false; }
  isInline(): boolean { return true; }
  getData(): ScriptureData { return this.__data; }
  exportJSON(): SerializedScriptureReferenceNode { return { ...super.exportJSON(), data: this.__data, type: 'scripture-reference', version: 1 }; }
  decorate(): ReactNode { return <ScriptureReferenceView data={this.__data} />; }
}

export const $createScriptureReferenceNode = (data: ScriptureData) => $applyNodeReplacement(new ScriptureReferenceNode({ ...data, display: 'inline' }));
export const $isScriptureReferenceNode = (node: LexicalNode | null | undefined): node is ScriptureReferenceNode => node instanceof ScriptureReferenceNode;
