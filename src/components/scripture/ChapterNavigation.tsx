import { ArrowLeft, ArrowRight } from 'lucide-react';

type ChapterNavigationProps = {
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
};

const ChapterNavigation = ({ canGoNext, canGoPrevious, onNext, onPrevious }: ChapterNavigationProps) => (
  <div className="flex flex-col gap-3">
    <button
      type="button"
      onClick={onPrevious}
      disabled={!canGoPrevious}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 font-bold text-zinc-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:focus:ring-offset-black"
    >
      <ArrowLeft size={18} />
      Previous
    </button>
    <button
      type="button"
      onClick={onNext}
      disabled={!canGoNext}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-800 px-6 py-3 font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:focus:ring-offset-black"
    >
      Next Chapter
      <ArrowRight size={18} />
    </button>
  </div>
);

export default ChapterNavigation;
