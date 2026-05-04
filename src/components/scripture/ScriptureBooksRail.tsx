import type { BibleBook } from '../../types/scripture';

type ScriptureBooksRailProps = {
  books: BibleBook[];
  darkMode: boolean;
  selectedBookId: string;
  onBookChange: (value: string) => void;
};

const ScriptureBooksRail = ({ books, darkMode, selectedBookId, onBookChange }: ScriptureBooksRailProps) => (
  <aside
    className={`hidden w-44 shrink-0 border-r px-4 py-5 md:block ${
      darkMode ? 'border-white/10 bg-[#111111]' : 'border-black/10 bg-[#f8f5ef]'
    }`}
  >
    <div className="sticky top-0">
      <p className={`mb-4 text-xs font-black uppercase tracking-[0.16em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>
        Books
      </p>
      <div className="max-h-[calc(100vh-5rem)] overflow-y-auto pr-1">
        {books.length === 0 ? (
          <p className={`text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>Books will appear here once the API responds.</p>
        ) : (
          <div className="grid gap-1">
            {books.map((book) => {
              const isSelected = book.id === selectedBookId;

              return (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => onBookChange(book.id)}
                  className={`rounded-lg px-2 py-1.5 text-left text-xs font-bold leading-tight transition ${
                    isSelected
                      ? 'bg-red-800 text-white'
                      : darkMode
                        ? 'text-stone-300 hover:bg-white/10'
                        : 'text-zinc-700 hover:bg-white'
                  }`}
                >
                  {book.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </aside>
);

export default ScriptureBooksRail;
