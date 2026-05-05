import { Sparkles } from 'lucide-react';
import { useProject52 } from '../../contexts/Project52Context';

type RotatingCatchphraseProps = {
  darkMode: boolean;
};

const RotatingCatchphrase = ({ darkMode }: RotatingCatchphraseProps) => {
  const { activeCatchphrase: activePhrase } = useProject52();

  return (
    <div
      className={`mb-6 inline-flex min-h-14 max-w-full items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold tracking-[0.14em] sm:min-h-9 sm:text-xs ${darkMode ? 'border-red-300/20 bg-red-950/30 text-red-100' : 'border-red-900/15 bg-white/70 text-red-950'
        }`}
    >
      <Sparkles size={14} className="shrink-0" />
      <span key={activePhrase.label} className="project52-catchphrase inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="uppercase">{activePhrase.label}</span>
        {activePhrase.scripture && (
          <span className={`shrink-0 normal-case tracking-normal ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
            {activePhrase.scripture}
          </span>
        )}
      </span>
    </div>
  );
};

export default RotatingCatchphrase;
