import { lazy, Suspense } from 'react';
import type { AudioVisualItem } from '../../../types/audioVisual';
import { getPlayableMediaUrl } from './mediaWatchUtils';

const loadReactPlayer = () => import('react-player');
const ReactPlayer = lazy(loadReactPlayer);

export const prefetchVideoPlayer = () => {
  void loadReactPlayer();
};

type VideoPlayerProps = {
  autoPlay?: boolean;
  darkMode: boolean;
  isShort?: boolean;
  item: AudioVisualItem;
  onEnded?: () => void;
};

const VideoPlayer = ({ autoPlay = false, darkMode, isShort = false, item, onEnded }: VideoPlayerProps) => {
  const url = getPlayableMediaUrl(item);

  return (
    <section className={`relative ${isShort ? 'mx-auto w-full max-w-[30rem]' : ''}`}>
      <div
        className={`absolute inset-x-4 -bottom-8 top-10 rounded-[2rem] blur-3xl ${
          darkMode ? 'bg-red-950/45' : 'bg-red-900/15'
        }`}
      />
      <div
        className={`relative overflow-hidden rounded-[2rem] border shadow-2xl ${
          darkMode ? 'border-white/10 bg-black shadow-red-950/25' : 'border-black/10 bg-black shadow-zinc-900/20'
        }`}
      >
        <div className={isShort ? 'aspect-[9/16]' : 'aspect-video'}>
          {url ? (
            <Suspense fallback={<PlayerLoadingState darkMode={darkMode} />}>
              <ReactPlayer
                controls
                height="100%"
                light={autoPlay ? false : item.thumbnailUrl || false}
                onEnded={onEnded}
                playing={autoPlay}
                src={url}
                width="100%"
              />
            </Suspense>
          ) : (
            <div className="grid size-full place-items-center bg-black px-6 text-center text-sm font-bold text-stone-300">
              This media item does not have a playable YouTube URL yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const PlayerLoadingState = ({ darkMode }: { darkMode: boolean }) => (
  <div className="relative grid size-full place-items-center overflow-hidden bg-black px-6 text-center">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(153,27,27,0.35),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />
    <div className="absolute inset-x-12 top-10 h-px bg-gradient-to-r from-transparent via-red-200/30 to-transparent" />
    <div className={`relative w-full max-w-sm rounded-3xl border p-6 shadow-2xl backdrop-blur-xl ${
      darkMode ? 'border-white/10 bg-white/[0.06] shadow-red-950/25' : 'border-white/15 bg-white/[0.08] shadow-red-950/20'
    }`}>
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full border border-red-200/25 bg-red-950/35 shadow-lg shadow-red-950/30">
        <div className="size-6 animate-pulse rounded-sm border-l-2 border-t-2 border-red-100" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-100">Preparing message</p>
      <div className="mt-5 grid gap-2">
        {[0, 1, 2].map((line) => (
          <div
            key={line}
            className="h-2 animate-pulse rounded-full bg-gradient-to-r from-white/10 via-white/35 to-white/10"
            style={{
              animationDelay: `${line * 180}ms`,
              width: `${100 - line * 14}%`,
            }}
          />
        ))}
      </div>
      <p className="mt-5 text-sm font-bold leading-6 text-stone-300">
        Warming the player and setting the table for the Word.
      </p>
    </div>
  </div>
);

export default VideoPlayer;
