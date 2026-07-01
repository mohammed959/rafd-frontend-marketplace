'use client';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { X, Loader2, ImagePlus } from 'lucide-react';
import api from '@/lib/api';

const MAX_IMAGES = 3;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface Props {
  /** Current image URLs (Bunny CDN). */
  value: string[];
  /** Called with the new full list after add/remove. */
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

/**
 * Lets a customer attach up to 3 delivery-location photos. Each selected file
 * is uploaded to the backend (which stores it in Bunny) and the returned CDN
 * URL is added to the list. Works on mobile (camera) and desktop (file
 * picker). The list is fully controlled by the parent.
 */
export function DeliveryImagesUploader({ value, onChange, disabled }: Props) {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const remaining = MAX_IMAGES - value.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const picked = Array.from(files).slice(0, remaining);
    if (files.length > remaining) toast.error(t('checkout.imagesMax', { max: MAX_IMAGES }));

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of picked) {
        if (!ACCEPTED.includes(file.type)) { toast.error(t('checkout.imageType')); continue; }
        if (file.size > MAX_SIZE) { toast.error(t('checkout.imageTooLarge')); continue; }
        const fd = new FormData();
        fd.append('file', file);
        const res = await api.post<{ data: { url: string } }>(
          '/uploads/delivery-image',
          fd,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        uploaded.push(res.data.data.url);
      }
      if (uploaded.length) onChange([...value, ...uploaded].slice(0, MAX_IMAGES));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('checkout.imageUploadFailed'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            {!disabled && (
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={t('common.delete')}
                className="absolute end-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {!disabled && value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-brand-300 hover:text-brand-500 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            <span className="text-[10px] font-medium">{t('checkout.addPhoto')}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
