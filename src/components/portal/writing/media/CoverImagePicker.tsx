import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { fetchMediaAssets, mediaAssetImageUrl, type MediaAsset, uploadMediaAsset } from '../../../../services/mediaAssetsApi';

type CoverImagePickerProps = {
  accessToken: string;
  canUpload: boolean;
  darkMode: boolean;
  disabled?: boolean;
  onChange: (asset: MediaAsset | null) => void;
  selectedAsset: MediaAsset | null;
  selectedAssetId?: string;
};

const CoverImagePicker = ({
  accessToken,
  canUpload,
  darkMode,
  disabled = false,
  onChange,
  selectedAsset,
  selectedAssetId = '',
}: CoverImagePickerProps) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchMediaAssets(accessToken, controller.signal)
      .then((page) => setAssets(page.results))
      .catch((err) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load images.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [accessToken, isOpen]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const asset = await uploadMediaAsset(accessToken, file, { title: file.name });
      setAssets((current) => [asset, ...current]);
      onChange(asset);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload image.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const selectedImageUrl = mediaAssetImageUrl(selectedAsset);
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';

  return (
    <div className={'border-t pt-5 ' + (darkMode ? 'border-white/10' : 'border-black/10')}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800">Cover Image</p>
      {selectedImageUrl ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-black/10">
          <img alt={selectedAsset?.alt_text || selectedAsset?.title || 'Selected cover image'} className="aspect-video w-full object-cover" src={selectedImageUrl} />
        </div>
      ) : selectedAssetId ? (
        <p className={'mt-3 text-sm leading-6 ' + mutedTextClass}>A cover image is selected for this article.</p>
      ) : (
        <p className={'mt-3 text-sm leading-6 ' + mutedTextClass}>Choose an existing image or upload a new cover.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button className={darkMode ? 'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-stone-100 hover:bg-[#171717] disabled:opacity-60' : 'inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black text-zinc-950 hover:bg-[#fffaf0] disabled:opacity-60'} disabled={disabled} onClick={() => setIsOpen((current) => !current)} type="button">
          <ImagePlus size={15} /> {selectedAssetId ? 'Change image' : 'Choose image'}
        </button>
        {selectedAssetId ? (
          <button className="inline-flex items-center gap-2 rounded-full border border-red-900/20 px-4 py-2 text-sm font-black text-red-800 disabled:opacity-60" disabled={disabled} onClick={() => onChange(null)} type="button">
            <X size={15} /> Remove
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className="mt-4 grid gap-3">
          {canUpload ? (
            <div>
              <input accept="image/*" className="sr-only" disabled={disabled || uploading} onChange={handleUpload} ref={fileInput} type="file" />
              <button className="inline-flex items-center gap-2 rounded-full border border-red-900/20 px-4 py-2 text-sm font-black text-red-800 disabled:opacity-60" disabled={disabled || uploading} onClick={() => fileInput.current?.click()} type="button">
                <ImagePlus size={15} /> {uploading ? 'Uploading...' : 'Upload image'}
              </button>
            </div>
          ) : null}

          {loading ? <p className={'text-sm ' + mutedTextClass}>Loading images...</p> : null}
          {error ? <p className="rounded-2xl bg-red-950/5 p-3 text-sm font-bold text-red-800">{error}</p> : null}
          {!loading && assets.length ? (
            <div className="grid grid-cols-3 gap-2">
              {assets.map((asset) => {
                const imageUrl = mediaAssetImageUrl(asset);
                return (
                  <button key={asset.id} className={'overflow-hidden rounded-xl border text-left transition hover:-translate-y-0.5 ' + (String(asset.id) === selectedAssetId ? 'border-red-800 ring-2 ring-red-800/20' : darkMode ? 'border-white/10' : 'border-black/10')} onClick={() => { onChange(asset); setIsOpen(false); }} type="button">
                    {imageUrl ? <img alt={asset.alt_text || asset.title || ''} className="aspect-square w-full object-cover" src={imageUrl} /> : <span className={'grid aspect-square place-items-center text-xs ' + mutedTextClass}>Image</span>}
                  </button>
                );
              })}
            </div>
          ) : !loading ? <p className={'text-sm ' + mutedTextClass}>No images are available yet.</p> : null}
        </div>
      ) : null}
    </div>
  );
};

export default CoverImagePicker;