import { useEffect, useRef, useState } from 'react';
import { FolderOpen, ImagePlus, LoaderCircle, Upload, X } from 'lucide-react';
import ResponsiveImage from '../../../media/ResponsiveImage';
import { fetchMediaAssets, type MediaAsset, uploadMediaAsset } from '../../../../services/mediaAssetsApi';

type WritingMediaEmbedPickerProps = {
  accessToken: string;
  canUpload: boolean;
  darkMode: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => Promise<void>;
};

type PickerTab = 'library' | 'upload';

const WritingMediaEmbedPicker = ({ accessToken, canUpload, darkMode, onClose, onSelect }: WritingMediaEmbedPickerProps) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [localPreview, setLocalPreview] = useState('');
  const [selectingId, setSelectingId] = useState<number | string | null>(null);
  const [tab, setTab] = useState<PickerTab>(canUpload ? 'upload' : 'library');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';
  const surfaceClass = darkMode ? 'border-white/10 bg-zinc-950 text-stone-100' : 'border-black/10 bg-[#f8f5ef] text-zinc-950';
  const inputClass = darkMode ? 'border-white/10 bg-[#171717] hover:bg-white/10' : 'border-black/10 bg-white hover:bg-black/[0.03]';

  useEffect(() => () => { if (localPreview) URL.revokeObjectURL(localPreview); }, [localPreview]);

  const loadLibrary = async () => {
    setLoading(true); setError('');
    try {
      const page = await fetchMediaAssets(accessToken);
      setAssets(page.results.filter((asset) => asset.status === 'ready'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load media.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tab === 'library') void loadLibrary(); }, [tab]);

  const select = async (asset: MediaAsset) => {
    setSelectingId(asset.id); setError('');
    try { await onSelect(asset); onClose(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to insert this image.'); } finally { setSelectingId(null); }
  };

  const upload = async (file: File) => {
    const nextPreview = URL.createObjectURL(file);
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(nextPreview); setLoading(true); setError(''); setUploadMessage('Uploading image...');
    try {
      const asset = await uploadMediaAsset(accessToken, file, { title: file.name });
      setUploadMessage('Adding image to your article...');
      await select(asset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload image.');
      setUploadMessage('');
    } finally {
      setLoading(false);
    }
  };

  const pickFile = (file?: File) => { if (file?.type.startsWith('image/')) void upload(file); else if (file) setError('Choose an image file.'); };

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-4 backdrop-blur-[1px]" role="dialog">
      <section aria-label="Insert image" className={'w-full max-w-3xl border p-5 shadow-2xl ' + surfaceClass}>
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-800">Insert Image</p><p className={'mt-1 text-sm ' + mutedTextClass}>Add a new image or reuse one from the church media library.</p></div><button aria-label="Close image picker" className={'grid size-9 place-items-center rounded-full border ' + inputClass} onClick={onClose} title="Close" type="button"><X size={16} /></button></div>
        <div className={'mt-5 flex items-center gap-1 border-b ' + (darkMode ? 'border-white/10' : 'border-black/10')}>
          {canUpload ? <button className={'border-b-2 px-3 py-2 text-sm font-black ' + (tab === 'upload' ? 'border-red-800 text-red-800' : 'border-transparent ' + mutedTextClass)} onClick={() => setTab('upload')} type="button"><Upload className="mr-2 inline size-4" />Upload</button> : null}
          <button className={'border-b-2 px-3 py-2 text-sm font-black ' + (tab === 'library' ? 'border-red-800 text-red-800' : 'border-transparent ' + mutedTextClass)} onClick={() => setTab('library')} type="button"><FolderOpen className="mr-2 inline size-4" />Library</button>
        </div>
        {tab === 'upload' ? <div className="mt-5 grid gap-4"><input accept="image/*" className="sr-only" onChange={(event) => { pickFile(event.target.files?.[0]); event.target.value = ''; }} ref={fileInput} type="file" /><button className={'grid min-h-48 place-items-center border border-dashed px-6 text-center transition ' + inputClass} disabled={loading} onClick={() => fileInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); pickFile(event.dataTransfer.files?.[0]); }} type="button">{localPreview ? <img alt="Selected upload preview" className="max-h-44 max-w-full object-contain" src={localPreview} /> : <span><ImagePlus className="mx-auto size-7 text-red-800" /><span className="mt-3 block text-sm font-black">Drop an image here or choose from your computer</span><span className={'mt-1 block text-sm ' + mutedTextClass}>JPEG, WebP, PNG, or AVIF</span></span>}</button>{loading ? <p className={'inline-flex items-center gap-2 text-sm font-bold ' + mutedTextClass}><LoaderCircle className="size-4 animate-spin text-red-800" />{uploadMessage}</p> : null}</div> : <div className="mt-5">{loading ? <p className={'inline-flex items-center gap-2 text-sm ' + mutedTextClass}><LoaderCircle className="size-4 animate-spin" />Loading media...</p> : null}{!loading && assets.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{assets.map((asset) => <button key={asset.id} className="overflow-hidden border border-black/10 text-left transition hover:-translate-y-0.5 disabled:opacity-50" disabled={selectingId !== null} onClick={() => void select(asset)} type="button"><ResponsiveImage alt={asset.alt_text || asset.title || ''} asset={asset} className="aspect-square w-full object-cover" preset="thumbnail" /><span className="block truncate px-2 py-2 text-xs font-bold">{asset.title || 'Untitled image'}</span></button>)}</div> : null}{!loading && !assets.length ? <p className={'text-sm ' + mutedTextClass}>No processed images are available yet.</p> : null}</div>}
        {error ? <p className="mt-4 text-sm font-bold text-red-800">{error}</p> : null}
      </section>
    </div>
  );
};

export default WritingMediaEmbedPicker;
