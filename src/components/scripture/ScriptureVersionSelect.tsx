import { ChevronDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { BibleVersion } from '../../types/scripture';
import BibleVersionPickerList from './BibleVersionPickerList';

type ScriptureVersionSelectProps = {
  darkMode: boolean;
  onChange: (value: string) => void;
  selectedVersionId: string;
  surface?: 'glass' | 'secondary';
  versions: BibleVersion[];
};

const ScriptureVersionSelect = ({
  darkMode,
  onChange,
  selectedVersionId,
  surface = 'glass',
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
          <BibleVersionPickerList
            darkMode={darkMode}
            mode="single"
            selectedVersionIds={[selectedVersionId]}
            versions={versions}
            onToggleVersion={(versionId) => {
              onChange(versionId);
              setOpen(false);
            }}
          />
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
        className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-black shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
          surface === 'secondary'
            ? darkMode
              ? 'border-white/15 bg-zinc-950 text-stone-100 shadow-black/25 focus:ring-offset-black hover:bg-[#171717]'
              : 'border-black/10 bg-white text-zinc-900 shadow-zinc-900/10 focus:ring-offset-[#f8f5ef] hover:bg-[#fffaf0]'
            : darkMode
              ? 'border-white/15 bg-white/10 text-stone-100 shadow-black/25 backdrop-blur-xl focus:ring-offset-black hover:bg-white/15'
              : 'border-black/10 bg-white/70 text-zinc-900 shadow-zinc-900/15 backdrop-blur-xl focus:ring-offset-[#f8f5ef] hover:bg-white/85'
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
