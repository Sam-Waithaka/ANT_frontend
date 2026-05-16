type MediaWatchStatusProps = {
  darkMode: boolean;
  onBack: () => void;
  status: 'error' | 'loading';
};

const MediaWatchStatus = ({ darkMode, onBack, status }: MediaWatchStatusProps) => {
  if (status === 'loading') {
    return (
      <div className={`rounded-3xl border p-8 text-center text-sm font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-black/10 bg-white text-zinc-700'}`}>
        Loading media player...
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border p-8 text-center ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-black/10 bg-white text-zinc-700'}`}>
      <h1 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Media unavailable</h1>
      <p className="mt-3 text-sm font-bold">We could not load this message right now.</p>
      <button type="button" onClick={onBack} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-red-800 px-5 text-sm font-black text-white hover:bg-red-700">
        Back to media
      </button>
    </div>
  );
};

export default MediaWatchStatus;
