type BibleVersionAvailabilityNoteProps = {
  className?: string;
  darkMode: boolean;
};

export const bibleVersionAvailabilityNote =
  'We are working toward adding more Bible versions and more languages.';

const BibleVersionAvailabilityNote = ({
  className = '',
  darkMode,
}: BibleVersionAvailabilityNoteProps) => (
  <p className={`text-xs font-bold leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-500'} ${className}`}>
    {bibleVersionAvailabilityNote}
  </p>
);

export default BibleVersionAvailabilityNote;
