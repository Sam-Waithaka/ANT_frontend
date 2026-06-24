import type { ReactNode } from 'react';
import { $applyNodeReplacement, DecoratorNode, type NodeKey, type SerializedLexicalNode } from 'lexical';
import PastoralBlockView from './PastoralBlockView';
import type { PastoralBlockData } from './pastoralTypes';
export type SerializedApplicationBlockNode = SerializedLexicalNode & { data: PastoralBlockData; type: 'application-block'; version: 1; };
export class ApplicationBlockNode extends DecoratorNode<ReactNode> {
     __data: PastoralBlockData; 
     static getType(): string { return 'application-block'; } 
     static clone(node: ApplicationBlockNode): ApplicationBlockNode { return new ApplicationBlockNode(node.__data, node.__key); } 
     static importJSON(serialized: SerializedApplicationBlockNode): ApplicationBlockNode { return $createApplicationBlockNode(serialized.data); } 
     constructor(data: PastoralBlockData, key?: NodeKey) { super(key); this.__data = data; } 
     createDOM(): HTMLElement { return document.createElement('div'); } 
     updateDOM(): false { return false; } exportJSON(): SerializedApplicationBlockNode { return { ...super.exportJSON(), data: this.__data, type: 'application-block', version: 1 }; } 
     decorate(): ReactNode { return <PastoralBlockView data={this.__data} kind="application" />; } 
    }
export const $createApplicationBlockNode = (data: PastoralBlockData) => $applyNodeReplacement(new ApplicationBlockNode(data));
