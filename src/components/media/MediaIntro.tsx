type MediaIntroProps = {
  darkMode: boolean;
};

const MediaIntro = ({ darkMode }: MediaIntroProps) => (
  <section className="px-4 py-12 sm:px-6 sm:py-16">
    <div className="mx-auto max-w-5xl">
      <div
        className={`border-b pb-8 ${
          darkMode ? 'border-white/10' : 'border-black/10'
        }`}
      >
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">
          Media
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight tracking-normal sm:text-5xl">
          Church Media
        </h1>
        <p className={`mt-4 max-w-2xl text-base leading-7 sm:text-lg ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
          Page skeleton prepared for sermons, livestreams, worship sessions, announcements, and teaching media from the audio-visual API.
        </p>
      </div>
    </div>
  </section>
);

export default MediaIntro;
