import type { ReactNode } from 'react';
import { $applyNodeReplacement, DecoratorNode, type NodeKey, type SerializedLexicalNode } from 'lexical';
import PastoralBlockView from './PastoralBlockView';
import type { PastoralBlockData } from './pastoralTypes';
export type SerializedReflectionBlockNode = SerializedLexicalNode & { data: PastoralBlockData; type: 'reflection-block'; version: 1; };
export class ReflectionBlockNode extends DecoratorNode<ReactNode> { __data: PastoralBlockData; static getType(): string { return 'reflection-block'; } static clone(node: ReflectionBlockNode): ReflectionBlockNode { return new ReflectionBlockNode(node.__data, node.__key); } static importJSON(serialized: SerializedReflectionBlockNode): ReflectionBlockNode { return $createReflectionBlockNode(serialized.data); } constructor(data: PastoralBlockData, key?: NodeKey) { super(key); this.__data = data; } createDOM(): HTMLElement { return document.createElement('div'); } updateDOM(): false { return false; } exportJSON(): SerializedReflectionBlockNode { return { ...super.exportJSON(), data: this.__data, type: 'reflection-block', version: 1 }; } decorate(): ReactNode { return <PastoralBlockView data={this.__data} kind="reflection" />; } }
export const $createReflectionBlockNode = (data: PastoralBlockData) => $applyNodeReplacement(new ReflectionBlockNode(data));
