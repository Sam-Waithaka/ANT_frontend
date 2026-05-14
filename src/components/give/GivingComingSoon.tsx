type GivingComingSoonProps = {
  darkMode: boolean;
};

const GivingComingSoon = ({ darkMode }: GivingComingSoonProps) => (
  <section className="px-4 pb-16 sm:px-6 sm:pb-20">
    <div className="mx-auto max-w-5xl">
      <div
        className={`rounded-3xl border p-6 sm:p-8 ${
          darkMode
            ? 'border-white/10 bg-white/5 text-stone-100'
            : 'border-black/10 bg-[#fffaf0]/85 text-zinc-950 shadow-sm'
        }`}
      >
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">
          Coming Soon
        </p>
        <p className={`mt-3 max-w-2xl text-base leading-7 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
          Secure online giving with automatic M-PESA confirmation.
        </p>
      </div>
    </div>
  </section>
);

export default GivingComingSoon;
