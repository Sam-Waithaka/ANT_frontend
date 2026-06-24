export type PastoralBlockKind = 'reflection' | 'prayer' | 'application';

export type PastoralBlockData = {
  authorVoice?: string;
  content: string;
  title?: string;
};
