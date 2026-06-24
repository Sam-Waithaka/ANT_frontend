import { createContext, useContext } from 'react';
import type { NodeKey } from 'lexical';
import type { BlockQuoteData } from './EditableBlockQuoteNode';
import type { PastoralBlockData, PastoralBlockKind } from './pastoralTypes';
import type { ScriptureData } from './scriptureTypes';

type SpecialBlockEditorValue = {
  onEditPastoral?: (request: { data: PastoralBlockData; kind: PastoralBlockKind; nodeKey: NodeKey }) => void;
  onEditQuotation?: (request: { data: BlockQuoteData; nodeKey: NodeKey }) => void;
  onEditScripture?: (request: { data: ScriptureData; nodeKey: NodeKey }) => void;
};

export const SpecialBlockEditorContext = createContext<SpecialBlockEditorValue>({});
export const useSpecialBlockEditor = () => useContext(SpecialBlockEditorContext);
