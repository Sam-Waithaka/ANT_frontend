export type LexicalSelectionBookmark = {
  anchor: { key: string; offset: number; type: 'element' | 'text' };
  focus: { key: string; offset: number; type: 'element' | 'text' };
};
