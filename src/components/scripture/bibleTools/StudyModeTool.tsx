type StudyModeToolProps = {
  darkMode: boolean;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

const StudyModeTool = ({ darkMode, enabled, onChange }: StudyModeToolProps) => (
  <div className={`rounded-2xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-[#fffaf0]'}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
          Reader detail
        </p>
        <h3 className="mt-2 text-lg font-black">Study mode</h3>
        <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
          Show annotation metadata, offsets, source markers, and raw source text in the reader.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-8 w-14 shrink-0 rounded-full border transition ${
          enabled
            ? 'border-red-700 bg-red-800'
            : darkMode
              ? 'border-white/15 bg-white/10'
              : 'border-black/10 bg-white'
        }`}
      >
        <span
          className={`absolute top-1 size-6 rounded-full bg-white shadow transition ${
            enabled ? 'left-7' : 'left-1'
          }`}
        />
        <span className="sr-only">{enabled ? 'Disable study mode' : 'Enable study mode'}</span>
      </button>
    </div>
    <p className={`mt-4 text-xs font-bold ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
      Superscript footnote markers stay visible in normal reading mode. Study mode only adds the deeper annotation inspection.
    </p>
  </div>
);

export default StudyModeTool;
