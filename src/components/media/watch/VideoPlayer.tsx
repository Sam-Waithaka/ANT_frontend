import { lazy, Suspense } from 'react';
import type { AudioVisualItem } from '../../../types/audioVisual';
import { getPlayableMediaUrl } from './mediaWatchUtils';

const ReactPlayer = lazy(() => import('react-player'));

type VideoPlayerProps = {
  darkMode: boolean;
  item: AudioVisualItem;
};

const VideoPlayer = ({ darkMode, item }: VideoPlayerProps) => {
  const url = getPlayableMediaUrl(item);

  return (
    <section className="relative">
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
        <div className="aspect-video">
          {url ? (
            <Suspense fallback={<div className="grid size-full place-items-center bg-black text-sm font-bold text-stone-300">Preparing player...</div>}>
              <ReactPlayer
                controls
                height="100%"
                light={item.thumbnailUrl || false}
                playing={false}
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

export default VideoPlayer;
