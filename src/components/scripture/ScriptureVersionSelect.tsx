import { ChevronDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { BibleVersion } from '../../types/scripture';

type ScriptureVersionSelectProps = {
  darkMode: boolean;
  onChange: (value: string) => void;
  selectedVersionId: string;
  versions: BibleVersion[];
};

const ScriptureVersionSelect = ({
  darkMode,
  onChange,
  selectedVersionId,
  versions,
}: ScriptureVersionSelectProps) => {
  const [open, setOpen] = useState(false);
  const selectedVersion = versions.find((version) => version.id === selectedVersionId);
  const versionDialog = open ? (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-version-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        onClick={() => setOpen(false)}
        aria-label="Close Bible version selector"
      />
      <div
        className={`relative max-h-[82vh] w-full max-w-md overflow-hidden rounded-[2rem] border shadow-2xl ${
          darkMode ? 'border-white/10 bg-[#080808] text-stone-100' : 'border-black/10 bg-[#f8f5ef] text-zinc-950'
        }`}
      >
        <div className={`flex items-center justify-between gap-4 border-b p-4 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>
              Scripture
            </p>
            <h2 id="mobile-version-title" className="mt-1 text-xl font-black">Bible version</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={`grid size-11 place-items-center rounded-full border transition ${
              darkMode ? 'border-white/10 bg-white/10 hover:bg-white/15' : 'border-black/10 bg-white hover:bg-[#fffaf0]'
            }`}
            aria-label="Close Bible version selector"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(82vh-5rem)] overflow-y-auto p-4">
          <div className="grid gap-2">
            {versions.map((version) => {
              const selected = version.id === selectedVersionId;

              return (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => {
                    onChange(version.id);
                    setOpen(false);
                  }}
                  className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left text-sm font-bold transition ${
                    selected
                      ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                      : darkMode
                        ? 'text-stone-300 hover:bg-white/10'
                        : 'text-zinc-700 hover:bg-white'
                  }`}
                >
                  <span className="min-w-14 font-black">{version.abbreviation || version.id}</span>
                  <span className={`text-xs ${selected ? 'text-white/75' : darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>
                    {version.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-black shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${
          darkMode
            ? 'border-white/15 bg-white/10 text-stone-100 shadow-black/25 hover:bg-white/15'
            : 'border-black/10 bg-white/70 text-zinc-950 shadow-zinc-900/15 hover:bg-white/85'
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="max-w-[6ch] truncate">{selectedVersion?.abbreviation || selectedVersion?.id || 'Bible'}</span>
        <ChevronDown className={darkMode ? 'text-red-200' : 'text-red-900'} size={15} />
      </button>

      {versionDialog ? createPortal(versionDialog, document.body) : null}
    </>
  );
};

export default ScriptureVersionSelect;
