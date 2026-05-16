import type { AudioVisualItem } from '../../../types/audioVisual';
import MediaRail from '../MediaRail';
import type { RelatedMediaOrdering } from '../mediaWatchContext';

type RelatedMediaRowProps = {
  canLoadMore?: boolean;
  darkMode: boolean;
  items: AudioVisualItem[];
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onOrderingChange?: (ordering: RelatedMediaOrdering) => void;
  ordering?: RelatedMediaOrdering;
};

const RelatedMediaRow = ({
  canLoadMore = false,
  darkMode,
  items,
  loadingMore = false,
  onLoadMore,
  onOrderingChange,
  ordering = 'latest',
}: RelatedMediaRowProps) => (
  <section className="grid gap-5">
    {items.length > 0 && onOrderingChange && (
      <div className="flex justify-center sm:justify-end">
        <div
          className={`inline-flex rounded-full border p-1 shadow-lg ${
            darkMode
              ? 'border-white/15 bg-white/10 shadow-black/20'
              : 'border-white/55 bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_16px_34px_rgba(24,24,27,0.10)]'
          }`}
        >
          {([
            ['latest', 'Latest first'],
            ['oldest', 'Oldest first'],
          ] as const).map(([value, label]) => {
            const isActive = ordering === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => onOrderingChange(value)}
                className={`min-h-9 rounded-full px-4 text-xs font-black transition hover:-translate-y-0.5 ${
                  isActive
                    ? darkMode
                      ? 'border border-white/15 bg-white/15 text-white shadow-sm shadow-black/20'
                      : 'border border-red-900/15 bg-white/70 text-red-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_24px_rgba(127,29,29,0.10)]'
                    : darkMode
                      ? 'border border-transparent text-stone-300 hover:bg-white/10'
                      : 'border border-transparent text-zinc-700 hover:bg-white/35'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    )}
    <MediaRail
      canLoadMore={canLoadMore}
      darkMode={darkMode}
      initialVisibleItems={5}
      items={items}
      loadingMore={loadingMore}
      title="Related"
      onLoadMore={onLoadMore}
    />
  </section>
);

export default RelatedMediaRow;
