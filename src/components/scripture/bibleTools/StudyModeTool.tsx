type StudyModeToolProps = {
  darkMode: boolean;
  enabled: boolean;
  loadingSources: boolean;
  loadingTokens: boolean;
  sourceStatus: string;
  sources: Array<{
    format?: string;
    id: string;
    rawText?: string;
    source?: string;
    title: string;
  }>;
  tokenStatus: string;
  tokens: Array<{
    id: string;
    lemma?: string;
    morphology?: string;
    strong?: string;
    text: string;
  }>;
  verse: number;
  onChange: (enabled: boolean) => void;
  onLoadSources: () => void;
  onLoadTokens: () => void;
  onVerseChange: (verse: number) => void;
};

const resultSurface = (darkMode: boolean) =>
  `rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white'}`;

const StudyModeTool = ({
  darkMode,
  enabled,
  loadingSources,
  loadingTokens,
  sourceStatus,
  sources,
  tokenStatus,
  tokens,
  verse,
  onChange,
  onLoadSources,
  onLoadTokens,
  onVerseChange,
}: StudyModeToolProps) => (
  <div className={`grid gap-4 rounded-2xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-[#fffaf0]'}`}>
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

    <div className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-white/70'}`}>
      <label className="text-xs font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200" htmlFor="study-verse">
        Verse tools
      </label>
      <input
        id="study-verse"
        min={1}
        type="number"
        value={verse}
        onChange={(event) => onVerseChange(Math.max(1, Number(event.target.value) || 1))}
        className={`mt-2 h-10 w-full rounded-full border px-3 text-sm font-bold outline-none ${
          darkMode ? 'border-white/15 bg-white/10 text-stone-100' : 'border-black/10 bg-white text-zinc-950'
        }`}
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onLoadTokens}
          className="min-h-10 rounded-full bg-red-800 px-3 text-xs font-black text-white transition hover:bg-red-700"
        >
          {loadingTokens ? 'Loading...' : 'Load tokens'}
        </button>
        <button
          type="button"
          onClick={onLoadSources}
          className={`min-h-10 rounded-full border px-3 text-xs font-black transition ${
            darkMode ? 'border-white/10 bg-white/10 text-stone-100 hover:bg-white/15' : 'border-black/10 bg-white text-zinc-950 hover:bg-[#fffaf0]'
          }`}
        >
          {loadingSources ? 'Loading...' : 'Load source'}
        </button>
      </div>
    </div>

    {tokenStatus ? <p className="text-sm leading-6 text-red-800 dark:text-red-200">{tokenStatus}</p> : null}
    {tokens.length > 0 && (
      <div className="grid gap-2">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200">Tokens</p>
        {tokens.map((token) => (
          <article key={token.id} className={resultSurface(darkMode)}>
            <p className="text-sm font-black">{token.text}</p>
            <dl className={`mt-2 grid gap-1 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
              {token.strong && <div><dt className="inline font-black">Strong: </dt><dd className="inline">{token.strong}</dd></div>}
              {token.lemma && <div><dt className="inline font-black">Lemma: </dt><dd className="inline">{token.lemma}</dd></div>}
              {token.morphology && <div><dt className="inline font-black">Morphology: </dt><dd className="inline">{token.morphology}</dd></div>}
            </dl>
          </article>
        ))}
      </div>
    )}

    {sourceStatus ? <p className="text-sm leading-6 text-red-800 dark:text-red-200">{sourceStatus}</p> : null}
    {sources.length > 0 && (
      <div className="grid gap-2">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200">Sources</p>
        {sources.map((source) => (
          <article key={source.id} className={resultSurface(darkMode)}>
            <p className="text-sm font-black">{source.title}</p>
            {[source.source, source.format].filter(Boolean).length > 0 && (
              <p className={`mt-1 text-xs ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                {[source.source, source.format].filter(Boolean).join(' · ')}
              </p>
            )}
            {source.rawText && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-black text-red-900 dark:text-red-200">Raw source</summary>
                <pre className={`mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg p-2 font-mono text-[11px] ${darkMode ? 'bg-black/35 text-stone-300' : 'bg-[#fffaf0] text-zinc-700'}`}>
                  {source.rawText}
                </pre>
              </details>
            )}
          </article>
        ))}
      </div>
    )}
  </div>
);

export default StudyModeTool;
