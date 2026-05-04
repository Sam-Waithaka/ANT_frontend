import { BookOpen, CalendarDays, CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { BibleBook, BibleChapter, BibleVersion } from '../../types/scripture';
import BibleToolsPanel from './BibleToolsPanel';

type ScriptureMobilePanelsProps = {
  books: BibleBook[];
  darkMode: boolean;
  selectedBook?: BibleBook;
  selectedChapter?: BibleChapter;
  selectedVersion?: BibleVersion;
  versions: BibleVersion[];
};

type ActivePanel = 'tools' | 'project52' | null;

const ScriptureMobilePanels = ({
  books,
  darkMode,
  selectedBook,
  selectedChapter,
  selectedVersion,
  versions,
}: ScriptureMobilePanelsProps) => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  useEffect(() => {
    if (!activePanel) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePanel(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePanel]);

  const modalTitle = activePanel === 'tools' ? 'Bible Tools' : 'Project 52';

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080808]/95 px-4 py-3 backdrop-blur-xl xl:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActivePanel('tools')}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-800 px-4 text-sm font-black text-white shadow-lg shadow-red-950/25 transition active:scale-[0.98]"
          >
            <BookOpen size={18} />
            Bible Tools
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('project52')}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black shadow-lg transition active:scale-[0.98] ${
              darkMode
                ? 'border-white/10 bg-white/10 text-stone-100 shadow-black/25'
                : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/10'
            }`}
          >
            <CalendarDays size={18} />
            Project 52
          </button>
        </div>
      </nav>

      {activePanel ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-3 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scripture-mobile-panel-title"
        >
          <div
            className={`max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-[2rem] border shadow-2xl ${
              darkMode ? 'border-white/10 bg-[#080808] text-stone-100' : 'border-black/10 bg-[#f8f5ef] text-zinc-950'
            }`}
          >
            <div className={`flex items-center justify-between gap-4 border-b p-4 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-900 dark:text-red-200">Scripture</p>
                <h2 id="scripture-mobile-panel-title" className="mt-1 text-xl font-black">{modalTitle}</h2>
              </div>
              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className={`grid size-11 place-items-center rounded-full border transition ${
                  darkMode ? 'border-white/10 bg-white/10 hover:bg-white/15' : 'border-black/10 bg-white hover:bg-[#fffaf0]'
                }`}
                aria-label={`Close ${modalTitle}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[calc(86vh-5rem)] overflow-y-auto p-4">
              {activePanel === 'tools' ? (
                <BibleToolsPanel
                  books={books}
                  darkMode={darkMode}
                  selectedBook={selectedBook}
                  selectedChapter={selectedChapter}
                  selectedVersion={selectedVersion}
                  versions={versions}
                />
              ) : (
                <section
                  className={`rounded-[2rem] border p-5 shadow-sm ${
                    darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`grid size-11 place-items-center rounded-full ${darkMode ? 'bg-red-950/40 text-red-100' : 'bg-red-900/10 text-red-900'}`}>
                      <CalendarDays size={20} />
                    </span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Project 52</p>
                      <h3 className="mt-1 text-2xl font-black">Continue the journey</h3>
                    </div>
                  </div>
                  <div className={`mt-5 grid gap-3 text-sm ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={17} className={darkMode ? 'text-red-200' : 'text-red-800'} />
                      Read alongside the weekly plan
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={17} className={darkMode ? 'text-red-200' : 'text-red-800'} />
                      Switch chapters without losing focus
                    </div>
                  </div>
                  <a
                    href="/project52"
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-red-800 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 dark:focus:ring-offset-black sm:w-auto"
                  >
                    Open Project 52
                  </a>
                </section>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ScriptureMobilePanels;
