'use client';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import {
  FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle, X,
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface ImportError {
  rowNumber: number;
  field?: string;
  message: string;
}

interface ImportSummary {
  totalRows: number;
  productsCreated: number;
  variantsCreated: number;
  errors: ImportError[];
}

export default function AdminImportsPage() {
  const t = useTranslations();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportSummary | null>(null);

  const downloadTemplate = async () => {
    try {
      const res = await api.get('/products/import/template', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-import-template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download template');
    }
  };

  const onSelect = (f: File | null) => {
    if (!f) return setFile(null);
    if (!/\.xlsx?$/i.test(f.name)) {
      toast.error('Pick an .xlsx file');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File is larger than 10 MB');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const submit = async () => {
    if (!file) return toast.error('Choose a file first');
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ data: ImportSummary; message: string }>(
        '/products/import/excel',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResult(res.data.data);
      toast.success(res.data.message ?? 'Import complete');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.imports')}</h1>
      </div>

      <section className="rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-brand-500" />
          <h2 className="font-semibold text-gray-900">1. Start from the template</h2>
        </div>
        <p className="text-sm text-gray-600">
          Download the template, fill the rows, then upload below. One row per <strong>variant</strong> —
          rows that share <code className="font-mono text-xs">name</code> + <code className="font-mono text-xs">nameAr</code> are
          bundled into one product.
        </p>
        <Button variant="secondary" size="sm" onClick={downloadTemplate}>
          <Download className="h-4 w-4" /> Download template
        </Button>
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer font-semibold">Column reference</summary>
          <ul className="mt-2 ml-4 list-disc space-y-0.5">
            <li><code>name</code>, <code>nameAr</code> — required, group key</li>
            <li><code>description</code>, <code>descriptionAr</code> — optional, picked from first row</li>
            <li>Product images: upload <code>&#123;sku&#125;.jpg</code> to Bunny Storage. The CDN URL is generated from the SKU automatically.</li>
            <li><code>categorySlug</code> — required, must already exist</li>
            <li><code>subcategorySlug</code> — optional, must exist under the category if given</li>
            <li><code>featured</code> — true/false on the first row</li>
            <li><code>variantType</code> — PIECE / CARTON / DOZEN / BUNDLE</li>
            <li><code>sku</code> — required, unique</li>
            <li><code>barcode</code>, <code>price</code>, <code>stock</code></li>
          </ul>
        </details>
      </section>

      <section className="rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-brand-500" />
          <h2 className="font-semibold text-gray-900">2. Upload your workbook</h2>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2">
            <FileSpreadsheet className="h-5 w-5 text-brand-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-800 truncate">{file.name}</p>
              <p className="text-xs text-brand-600">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => { setFile(null); setResult(null); if (fileRef.current) fileRef.current.value = ''; }}
              className="rounded-md p-1 text-brand-500 hover:bg-brand-100"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-8 text-sm text-gray-500 hover:border-brand-300 hover:bg-brand-50 transition-colors"
          >
            <Upload className="h-4 w-4" /> Click to pick an .xlsx file (max 10 MB)
          </button>
        )}

        <Button className="w-full" loading={uploading} disabled={!file} onClick={submit}>
          <Upload className="h-4 w-4" /> Run import
        </Button>
      </section>

      {result && (
        <section className="rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            {result.errors.length === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            <h2 className="font-semibold text-gray-900">3. Result</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <SummaryTile label="Rows read"        value={result.totalRows} />
            <SummaryTile label="Products created" value={result.productsCreated} color="green" />
            <SummaryTile label="Variants created" value={result.variantsCreated} color="green" />
          </div>

          {result.errors.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
              <p className="font-semibold text-amber-800 text-sm mb-2">{result.errors.length} row error(s)</p>
              <ul className="space-y-1 max-h-80 overflow-y-auto text-xs">
                {result.errors.map((e, i) => (
                  <li key={i} className="flex items-start gap-2 rounded bg-white border border-amber-100 px-2 py-1.5">
                    <span className="rounded bg-amber-200 px-1.5 py-0.5 font-mono font-bold text-amber-800 text-[10px]">
                      Row {e.rowNumber}
                    </span>
                    {e.field && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] text-amber-700">
                        {e.field}
                      </span>
                    )}
                    <span className="text-amber-800">{e.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SummaryTile({ label, value, color = 'gray' }: { label: string; value: number; color?: 'gray' | 'green' }) {
  return (
    <div className={`rounded-xl border p-3 ${color === 'green' ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
      <p className={`text-xs ${color === 'green' ? 'text-green-700' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color === 'green' ? 'text-green-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
