import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import ResponsiveImage from '../../../media/ResponsiveImage';
import { fetchMediaAssets, type MediaAsset } from '../../../../services/mediaAssetsApi';

type WritingMediaEmbedPickerProps = {
  accessToken: string;
  darkMode: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => Promise<void>;
};

const WritingMediaEmbedPicker = ({ accessToken, darkMode, onClose, onSelect }: WritingMediaEmbedPickerProps) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<number | string | null>(null);
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';

  useEffect(() => {
    const controller = new AbortController();
    fetchMediaAssets(accessToken, controller.signal)
      .then((page) => setAssets(page.results.filter((asset) => asset.status === 'ready')))
      .catch((err) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load media.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [accessToken]);

  const select = async (asset: MediaAsset) => {
    setSelectingId(asset.id); setError('');
    try { await onSelect(asset); onClose(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to insert this image.'); } finally { setSelectingId(null); }
  };

  return (
    <section aria-label="Insert image" className={'mb-4 border px-4 py-4 ' + (darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#fffaf0]')}>
      <div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-red-800">Insert Image</p><button aria-label="Close image picker" className={mutedTextClass} onClick={onClose} type="button"><X size={16} /></button></div>
      {loading ? <p className={'mt-3 text-sm ' + mutedTextClass}>Loading media...</p> : null}
      {error ? <p className="mt-3 text-sm font-bold text-red-800">{error}</p> : null}
      {!loading && assets.length ? <div className="mt-3 grid grid-cols-3 gap-2">{assets.map((asset) => <button key={asset.id} className="overflow-hidden border border-black/10 text-left disabled:opacity-50" disabled={selectingId !== null} onClick={() => void select(asset)} type="button"><ResponsiveImage alt={asset.alt_text || asset.title || ''} asset={asset} className="aspect-square w-full object-cover" preset="thumbnail" /><span className="sr-only"><ImagePlus size={14} /> Insert {asset.title}</span></button>)}</div> : null}
      {!loading && !assets.length ? <p className={'mt-3 text-sm ' + mutedTextClass}>No processed images are available.</p> : null}
    </section>
  );
};

export default WritingMediaEmbedPicker;


