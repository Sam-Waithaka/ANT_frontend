import type { ReactNode } from 'react';
import { BookOpenText } from 'lucide-react';
import { $applyNodeReplacement, DecoratorNode, type NodeKey, type SerializedLexicalNode } from 'lexical';
import type { ScriptureData } from './scriptureTypes';

export type SerializedScriptureBlockNode = SerializedLexicalNode & { data: ScriptureData; type: 'scripture-block'; version: 1; };

const ScriptureBlockView = ({ data }: { data: ScriptureData }) => {
  const isPassage = data.display === 'passage';
  const lines = data.verses?.length ? data.verses : data.text.split(/\n+/).filter(Boolean).map((text, index) => ({ number: index + 1, text }));
  const showVerseNumbers = isPassage || (data.verses?.length || 0) > 1;
  return <section aria-label={`${isPassage ? 'Scripture reading' : 'Scripture'} ${data.reference}`} className="my-8 rounded-2xl border border-red-900/15 bg-white px-6 py-6 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25 sm:px-8"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200"><BookOpenText size={15} /> {isPassage ? 'Reading' : 'Scripture'}</p>{showVerseNumbers ? <div className="mt-5 grid gap-3 font-serif text-lg leading-8 sm:text-xl">{lines.map((verse) => <p key={`${verse.number}-${verse.text}`}><sup className="mr-2 font-sans text-xs font-bold text-zinc-500 dark:text-stone-400">{verse.number}</sup>{verse.text}</p>)}</div> : <p className="mt-5 font-serif text-2xl leading-10 sm:text-3xl">{data.text}</p>}<p className="mt-5 border-t border-red-900/10 pt-4 text-sm text-zinc-600 dark:border-white/10 dark:text-stone-300">{data.reference}{data.version ? ` · ${data.version}` : ''}</p></section>;
};

export class ScriptureBlockNode extends DecoratorNode<ReactNode> {
  __data: ScriptureData;
  static getType(): string { return 'scripture-block'; }
  static clone(node: ScriptureBlockNode): ScriptureBlockNode { return new ScriptureBlockNode(node.__data, node.__key); }
  static importJSON(serializedNode: SerializedScriptureBlockNode): ScriptureBlockNode { return $createScriptureBlockNode(serializedNode.data); }
  constructor(data: ScriptureData, key?: NodeKey) { super(key); this.__data = data; }
  createDOM(): HTMLElement { return document.createElement('div'); }
  updateDOM(): false { return false; }
  getData(): ScriptureData { return this.__data; }
  exportJSON(): SerializedScriptureBlockNode { return { ...super.exportJSON(), data: this.__data, type: 'scripture-block', version: 1 }; }
  decorate(): ReactNode { return <ScriptureBlockView data={this.__data} />; }
}
export const $createScriptureBlockNode = (data: ScriptureData) => $applyNodeReplacement(new ScriptureBlockNode({ ...data, display: data.display === 'passage' ? 'passage' : 'block' }));
