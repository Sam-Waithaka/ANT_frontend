import type { AutoplayMode } from './mediaAutoplay';
import type { AudioVisualItem } from '../../../types/audioVisual';

type AutoplayControlsProps = {
  autoplayEnabled: boolean;
  autoplayMode: AutoplayMode;
  countdown: number;
  darkMode: boolean;
  onCancelCountdown: () => void;
  onContinue: () => void;
  onPlayNow: (item: AudioVisualItem) => void;
  onStopAutoplay: () => void;
  onToggleAutoplay: () => void;
  pendingNextItem: AudioVisualItem | null;
  showStillWatching: boolean;
};

const queueLabel = (mode: AutoplayMode) => {
  if (mode === 'series') return 'series';
  if (mode === 'sermon') return 'sermon queue';
  if (mode === 'music') return 'music queue';
  if (mode === 'shorts') return 'shorts queue';
  return 'related queue';
};

const AutoplayControls = ({
  autoplayEnabled,
  autoplayMode,
  countdown,
  darkMode,
  onCancelCountdown,
  onContinue,
  onPlayNow,
  onStopAutoplay,
  onToggleAutoplay,
  pendingNextItem,
  showStillWatching,
}: AutoplayControlsProps) => (
  <section
    className={`rounded-3xl border p-4 shadow-xl ${
      darkMode ? 'border-white/10 bg-white/[0.05] shadow-black/20' : 'border-black/10 bg-white/80 shadow-zinc-900/10'
    }`}
  >
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Autoplay</p>
        <p className={`mt-1 text-sm font-bold ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
          {autoplayEnabled ? `Up next follows this ${queueLabel(autoplayMode)}.` : 'Autoplay is off. Turn it on to continue through related media.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleAutoplay}
        aria-pressed={autoplayEnabled}
        className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-black transition ${
          autoplayEnabled
            ? 'border-red-800 bg-red-800 text-white shadow-lg shadow-red-950/20 hover:bg-red-700'
            : darkMode
              ? 'border-white/15 bg-white/10 text-stone-100 hover:bg-white/15'
              : 'border-black/10 bg-white text-zinc-800 shadow-sm hover:bg-[#fffaf0]'
        }`}
      >
        Autoplay {autoplayEnabled ? 'On' : 'Off'}
      </button>
    </div>

    {pendingNextItem && countdown > 0 && (
      <div className={`mt-4 rounded-2xl border p-4 ${darkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-[#fffaf0]'}`}>
        <p className={`text-sm font-bold ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>Up next in {countdown}s</p>
        <h3 className={`mt-1 text-lg font-black ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{pendingNextItem.title}</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => onPlayNow(pendingNextItem)} className="inline-flex min-h-10 items-center rounded-full bg-red-800 px-4 text-sm font-black text-white hover:bg-red-700">
            Play now
          </button>
          <button
            type="button"
            onClick={onCancelCountdown}
            className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-black ${
              darkMode ? 'border-white/10 text-stone-200 hover:bg-white/10' : 'border-black/10 text-zinc-800 hover:bg-white'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    {showStillWatching && pendingNextItem && (
      <div className={`mt-4 rounded-2xl border p-4 ${darkMode ? 'border-red-200/15 bg-red-950/20' : 'border-red-900/15 bg-red-50'}`}>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Still watching?</p>
        <h3 className={`mt-2 text-lg font-black ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{pendingNextItem.title}</h3>
        <p className={`mt-1 text-sm ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
          We paused autoplay so the queue does not keep running unattended.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={onContinue} className="inline-flex min-h-10 items-center rounded-full bg-red-800 px-4 text-sm font-black text-white hover:bg-red-700">
            Continue
          </button>
          <button
            type="button"
            onClick={onStopAutoplay}
            className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-black ${
              darkMode ? 'border-white/10 text-stone-200 hover:bg-white/10' : 'border-black/10 text-zinc-800 hover:bg-white'
            }`}
          >
            Stop autoplay
          </button>
        </div>
      </div>
    )}
  </section>
);

export default AutoplayControls;
