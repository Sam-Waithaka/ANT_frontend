import type { ParsedScriptureReference } from './mediaWatchUtils';
import ScriptureReferenceCard from './ScriptureReferenceCard';
import VideoMeta from './VideoMeta';
import type { AudioVisualItem } from '../../../types/audioVisual';

type WatchDetailsProps = {
  darkMode: boolean;
  item: AudioVisualItem;
  onShare: () => void;
  scriptureReferences: ParsedScriptureReference[];
  shareStatus: 'copied' | 'idle';
};

const ScriptureSection = ({
  darkMode,
  references,
  twoColumns = false,
}: {
  darkMode: boolean;
  references: ParsedScriptureReference[];
  twoColumns?: boolean;
}) => (
  <section className="grid gap-4">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Scripture</p>
      <h2 className={`mt-2 text-3xl font-extrabold tracking-normal ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Referenced Scriptures</h2>
    </div>
    <div className={`grid gap-4 ${twoColumns ? 'md:grid-cols-2' : ''}`}>
      {references.map((reference) => (
        <ScriptureReferenceCard key={reference.display} darkMode={darkMode} reference={reference} />
      ))}
    </div>
  </section>
);

const WatchDetails = ({ darkMode, item, onShare, scriptureReferences, shareStatus }: WatchDetailsProps) => {
  const showScriptureBesideMeta = item.mediaType.toLowerCase() === 'sermon' && scriptureReferences.length > 0;

  if (showScriptureBesideMeta) {
    return (
      <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)] md:items-start xl:grid-cols-[minmax(0,0.82fr)_minmax(30rem,1.18fr)]">
        <VideoMeta darkMode={darkMode} item={item} onShare={onShare} shareStatus={shareStatus} />
        <ScriptureSection darkMode={darkMode} references={scriptureReferences} />
      </div>
    );
  }

  return (
    <>
      <VideoMeta darkMode={darkMode} item={item} onShare={onShare} shareStatus={shareStatus} />
      {scriptureReferences.length > 0 && (
        <ScriptureSection darkMode={darkMode} references={scriptureReferences} twoColumns />
      )}
    </>
  );
};

export default WatchDetails;
