export type ScriptureDisplay = 'inline' | 'block' | 'passage';
export type ScriptureSource = 'api' | 'manual';

export type ScriptureVerse = {
  number: number;
  text: string;
};

export type ScriptureData = {
  display: ScriptureDisplay;
  reference: string;
  source: ScriptureSource;
  sourceId?: string;
  text: string;
  version: string;
  verses?: ScriptureVerse[];
};
