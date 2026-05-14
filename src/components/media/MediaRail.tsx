import type { AudioVisualItem } from '../../types/audioVisual';
import MediaCard from './MediaCard';

type MediaRailProps = {
  items: AudioVisualItem[];
  title: string;
  variant?: 'landscape' | 'portrait' | 'compact';
};

const MediaRail = ({ items, title, variant = 'landscape' }: MediaRailProps) => {
  if (items.length === 0) return null;

  const gridClass =
    variant === 'portrait'
      ? 'grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]'
      : 'grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]';

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">{title}</h2>
        <a href="#media-rail" className="text-sm font-black text-red-200 hover:text-white">View all</a>
      </div>
      <div className={`grid gap-4 ${gridClass}`}>
        {items.map((item) => (
          <MediaCard key={`${title}-${item.slug}`} item={item} variant={variant} />
        ))}
      </div>
    </section>
  );
};

export default MediaRail;
