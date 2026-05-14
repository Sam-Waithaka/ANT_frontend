import { Mic2, Music2 } from 'lucide-react';

type MediaPodcastComingSoonProps = {
  darkMode: boolean;
};

const MediaPodcastComingSoon = ({ darkMode }: MediaPodcastComingSoonProps) => (
  <section
    className={`overflow-hidden rounded-3xl border px-6 py-12 text-center shadow-2xl sm:px-10 ${
      darkMode
        ? 'border-white/10 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.2),transparent_38%),#050505] shadow-black/40'
        : 'border-black/10 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.09),transparent_38%),#fffaf0] shadow-zinc-900/10'
    }`}
  >
    <div className="mx-auto grid max-w-2xl justify-items-center">
      <div
        className={`mb-6 grid size-16 place-items-center rounded-full border ${
          darkMode ? 'border-white/15 bg-white/10 text-white' : 'border-black/10 bg-white text-red-800'
        }`}
      >
        <Mic2 size={28} />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-red-700">Spotify coming soon</p>
      <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Podcasts are coming soon</h2>
      <p className={`mt-4 max-w-xl text-base leading-8 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
        Audio teachings, church conversations, and messages for listening on the go will be available here once the
        Spotify collection is ready.
      </p>
      <div
        className={`mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-black ${
          darkMode ? 'border-white/10 bg-white/[0.06] text-stone-100' : 'border-black/10 bg-white text-zinc-900'
        }`}
      >
        <Music2 size={17} />
        Spotify collection in preparation
      </div>
    </div>
  </section>
);

export default MediaPodcastComingSoon;
