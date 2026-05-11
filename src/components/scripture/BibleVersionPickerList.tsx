import type { BibleVersion } from '../../types/scripture';

type BibleVersionPickerListProps = {
  darkMode: boolean;
  mode: 'single' | 'multiple';
  noteClassName?: string;
  optionClassName?: string;
  selectedVersionIds: string[];
  versions: BibleVersion[];
  onToggleVersion: (versionId: string) => void;
};

const bibleVersionAvailabilityNote =
  'We are working toward adding more Bible versions and more languages.';

const BibleVersionPickerList = ({
  darkMode,
  mode,
  noteClassName = 'mt-4 border-t border-black/10 pt-4 dark:border-white/10',
  optionClassName = '',
  selectedVersionIds,
  versions,
  onToggleVersion,
}: BibleVersionPickerListProps) => {
  const isSelected = (versionId: string) => selectedVersionIds.includes(versionId);

  return (
    <>
      <div className="grid gap-2">
        {versions.map((version) => {
          const selected = isSelected(version.id);
          const isLastSelected = mode === 'multiple' && selected && selectedVersionIds.length === 1;
          const optionContent = (
            <>
              {mode === 'multiple' ? (
                <input
                  checked={selected}
                  disabled={isLastSelected}
                  onChange={() => onToggleVersion(version.id)}
                  type="checkbox"
                  className="size-4 accent-red-800"
                />
              ) : null}
              <span className={`${mode === 'multiple' ? 'min-w-12' : 'min-w-14'} shrink-0 font-black`}>
                {version.abbreviation || version.id}
              </span>
              <span className={`min-w-0 truncate text-xs ${selected ? 'text-white/75' : darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>
                {version.name}
              </span>
            </>
          );
          const sharedClass = `flex min-h-12 min-w-0 items-center gap-3 rounded-2xl px-4 text-left text-sm font-bold transition ${
            selected
              ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
              : darkMode
                ? 'text-stone-300 hover:bg-white/10'
                : 'text-zinc-700 hover:bg-white'
          } ${isLastSelected ? 'cursor-not-allowed opacity-70' : mode === 'multiple' ? 'cursor-pointer' : ''} ${optionClassName}`;

          if (mode === 'multiple') {
            return (
              <label
                key={version.id}
                className={sharedClass}
                role="menuitemcheckbox"
                aria-checked={selected}
              >
                {optionContent}
              </label>
            );
          }

          return (
            <button
              key={version.id}
              type="button"
              onClick={() => onToggleVersion(version.id)}
              className={sharedClass}
            >
              {optionContent}
            </button>
          );
        })}
      </div>
      <p className={`text-xs font-bold leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-500'} ${noteClassName}`}>
        {bibleVersionAvailabilityNote}
      </p>
    </>
  );
};

export default BibleVersionPickerList;
