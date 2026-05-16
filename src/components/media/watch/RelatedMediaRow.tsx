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
          className={`inline-flex rounded-full border p-1 ${
            darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white/70 shadow-sm shadow-zinc-900/5'
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
                className={`min-h-9 rounded-full px-4 text-xs font-black transition ${
                  isActive
                    ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                    : darkMode
                      ? 'text-stone-300 hover:bg-white/10'
                      : 'text-zinc-700 hover:bg-[#fffaf0]'
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
