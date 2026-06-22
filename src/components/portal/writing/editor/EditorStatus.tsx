export type EditorSaveState = 'error' | 'idle' | 'saved' | 'saving';

type EditorStatusProps = {
  characterCount: number;
  darkMode: boolean;
  saveState?: EditorSaveState;
  wordCount: number;
};

const saveLabels: Record<EditorSaveState, string> = {
  error: 'Unable to save',
  idle: 'Not saved yet',
  saved: 'Saved',
  saving: 'Saving...',
};

const EditorStatus = ({ characterCount, darkMode, saveState = 'idle', wordCount }: EditorStatusProps) => (
  <footer className={`flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-xs ${darkMode ? 'border-white/10 text-stone-400' : 'border-black/10 text-zinc-600'}`}>
    <span>Words: {wordCount} &middot; Characters: {characterCount}</span>
    <span className={saveState === 'error' ? 'font-bold text-red-800' : ''}>{saveLabels[saveState]}</span>
  </footer>
);

export default EditorStatus;
