import { ArrowLeft } from 'lucide-react';

type WatchBackButtonProps = {
  darkMode: boolean;
  onBack: () => void;
};

const WatchBackButton = ({ darkMode, onBack }: WatchBackButtonProps) => (
  <button
    type="button"
    onClick={onBack}
    className={`group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-black shadow-xl backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 ${
      darkMode
        ? 'border-white/15 bg-white/[0.09] text-white shadow-black/30 ring-1 ring-white/10 hover:border-red-200/25 hover:bg-white/[0.13] hover:shadow-red-950/30'
        : 'border-white/70 bg-white/65 text-zinc-950 shadow-zinc-900/10 ring-1 ring-black/5 hover:border-red-900/10 hover:bg-white/85 hover:shadow-red-900/10'
    }`}
  >
    <span
      className={`grid size-7 place-items-center rounded-full transition ${
        darkMode ? 'bg-white/10 text-red-100 group-hover:bg-red-800' : 'bg-red-950/5 text-red-800 group-hover:bg-red-800 group-hover:text-white'
      }`}
    >
      <ArrowLeft size={16} />
    </span>
    Back
  </button>
);

export default WatchBackButton;
