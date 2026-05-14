import { BookOpen, ExternalLink } from 'lucide-react';
import type { ParsedScriptureReference } from './mediaWatchUtils';
import { createScriptureUrl } from './mediaWatchUtils';

type ScriptureReferenceCardProps = {
  darkMode: boolean;
  reference: ParsedScriptureReference;
};

const ScriptureReferenceCard = ({ darkMode, reference }: ScriptureReferenceCardProps) => (
  <article
    className={`rounded-2xl border p-5 shadow-lg ${
      darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`grid size-11 shrink-0 place-items-center rounded-full ${darkMode ? 'bg-red-950/50 text-red-100' : 'bg-red-50 text-red-800'}`}>
        <BookOpen size={19} />
      </div>
      <div>
        <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{reference.display}</h3>
        <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
          Open the full chapter in Scripture and keep the passage close to the message.
        </p>
      </div>
    </div>

    <div className="mt-5 flex flex-wrap gap-3">
      <a
        href={createScriptureUrl(reference)}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-800 px-4 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700"
      >
        Read Full Chapter
      </a>
      <a
        href={createScriptureUrl(reference)}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black transition hover:-translate-y-0.5 ${
          darkMode ? 'border-white/10 bg-white/5 text-stone-100 hover:bg-white/10' : 'border-black/10 bg-white text-zinc-800 hover:bg-[#fffaf0]'
        }`}
      >
        Open in Scripture
        <ExternalLink size={15} />
      </a>
    </div>
  </article>
);

export default ScriptureReferenceCard;
