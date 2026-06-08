'use client';
import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import {
  FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle, X,
  ArrowRight, ShieldCheck, MinusCircle, Sparkles, Info,
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { formatPrice, cn } from '@/lib/utils';

type RowStatus = 'VALID' | 'INVALID' | 'SKIPPED';

interface PreviewRow {
  rowNumber: number;
  sku: string | null;
  rawPrice: string | null;
  rawQuantity: string | null;
  price: number | null;
  quantity: number | null;
  status: RowStatus;
  errors: string[];
  warnings: string[];
  variantId: string | null;
  productName: string | null;
  oldPrice: number | null;
  oldQuantity: number | null;
}

interface PreviewSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  skippedRows: number;
}

interface PreviewResult {
  rows: PreviewRow[];
  summary: PreviewSummary;
}

interface AppliedRow {
  sku: string;
  productName: string | null;
  oldPrice: number;
  newPrice: number;
  oldQuantity: number;
  newQuantity: number;
  priceChanged: boolean;
  quantityChanged: boolean;
}

interface ApplyResult {
  batchId: string;
  appliedCount: number;
  skipped: Array<{ sku: string; reason: string }>;
  rows: AppliedRow[];
}

const STATUS_STYLE: Record<RowStatus, { bg: string; text: string; label: string }> = {
  VALID:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Valid' },
  INVALID: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Invalid' },
  SKIPPED: { bg: 'bg-amber-100',  text: 'text-amber-800',  label: 'Skipped' },
};

export default function BulkSkuUpdatePage() {
  const t = useTranslations();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [filter, setFilter] = useState<'ALL' | RowStatus>('ALL');

  const validRows  = useMemo(() => preview?.rows.filter((r) => r.status === 'VALID')  ?? [], [preview]);
  const invalidRows = useMemo(() => preview?.rows.filter((r) => r.status === 'INVALID') ?? [], [preview]);
  const skippedRows = useMemo(() => preview?.rows.filter((r) => r.status === 'SKIPPED') ?? [], [preview]);

  const visibleRows = useMemo(() => {
    if (!preview) return [];
    if (filter === 'ALL') return preview.rows;
    return preview.rows.filter((r) => r.status === filter);
  }, [preview, filter]);

  const downloadTemplate = async () => {
    try {
      const res = await api.get('/inventory-bulk/template', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bulk-sku-update-template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download template');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setFilter('ALL');
    if (fileRef.current) fileRef.current.value = '';
  };

  const onSelect = (f: File | null) => {
    if (!f) return reset();
    if (!/\.xlsx?$/i.test(f.name)) {
      toast.error('Pick an .xlsx file');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File is larger than 10 MB');
      return;
    }
    setFile(f);
    setPreview(null);
    setResult(null);
  };

  const runValidation = async () => {
    if (!file) return toast.error('Choose a file first');
    setValidating(true);
    setPreview(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ data: PreviewResult }>(
        '/inventory-bulk/preview',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setPreview(res.data.data);
      const s = res.data.data.summary;
      if (s.validRows === 0 && s.invalidRows > 0) {
        toast.error('No valid rows — fix the errors and re-upload');
      } else if (s.invalidRows > 0) {
        toast(`${s.validRows} valid · ${s.invalidRows} invalid`, { icon: '⚠️' });
      } else {
        toast.success(`${s.validRows} valid row(s) ready`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const confirmApply = async () => {
    if (!preview || validRows.length === 0) return;
    setApplying(true);
    try {
      const payload = {
        rows: validRows.map((r) => ({
          sku: r.sku!,
          price: r.price ?? null,
          quantity: r.quantity ?? null,
        })),
      };
      const res = await api.post<{ data: ApplyResult; message: string }>(
        '/inventory-bulk/apply',
        payload,
      );
      setResult(res.data.data);
      toast.success(res.data.message ?? 'Update applied');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Apply failed');
    } finally {
      setApplying(false);
    }
  };

  const cancelImport = () => {
    reset();
    toast('Import cancelled — pick a new file to start over.', { icon: '✖️' });
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.bulkSku')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update existing variants by SKU. Leave price or quantity blank to keep the old value.
          </p>
        </div>
        {(preview || result) && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <X className="h-4 w-4" /> Start over
          </Button>
        )}
      </div>

      {/* Step 1 — Template */}
      <section className="rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-brand-500" />
          <h2 className="font-semibold text-gray-900">1. Download the template</h2>
        </div>
        <p className="text-sm text-gray-600">
          The template has three columns: <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">sku</code>,{' '}
          <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">price</code>, and{' '}
          <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">quantity</code>. Only SKU is required.
        </p>
        <Button variant="secondary" size="sm" onClick={downloadTemplate}>
          <Download className="h-4 w-4" /> Download template
        </Button>
        <ul className="text-xs text-gray-500 space-y-1 mt-2 list-disc ml-5">
          <li>Price must be greater than zero. Empty cell keeps the old price.</li>
          <li>Quantity must be a non-negative whole number. <code className="font-mono">0</code> marks the SKU as out of stock.</li>
          <li>Rows with both fields empty are skipped automatically.</li>
        </ul>
      </section>

      {/* Step 2 — Upload */}
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
              onClick={reset}
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

        <Button className="w-full" loading={validating} disabled={!file || applying} onClick={runValidation}>
          <ShieldCheck className="h-4 w-4" /> Validate file
        </Button>
      </section>

      {/* Step 3 — Preview */}
      {preview && !result && (
        <section className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-gray-900">3. Review the preview</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryTile label="Total rows"   value={preview.summary.totalRows}   tone="gray"  />
            <SummaryTile label="Valid"        value={preview.summary.validRows}   tone="green" />
            <SummaryTile label="Invalid"      value={preview.summary.invalidRows} tone="red"   />
            <SummaryTile label="Skipped"      value={preview.summary.skippedRows} tone="amber" />
          </div>

          {invalidRows.length > 0 && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-snug">
                <strong>{invalidRows.length}</strong> row(s) won't be applied. You can continue with the{' '}
                <strong>{validRows.length}</strong> valid row(s), or cancel and fix the file.
              </p>
            </div>
          )}

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'VALID', 'INVALID', 'SKIPPED'] as const).map((key) => {
              const active = filter === key;
              const count =
                key === 'ALL'     ? preview.summary.totalRows
                : key === 'VALID' ? preview.summary.validRows
                : key === 'INVALID' ? preview.summary.invalidRows
                : preview.summary.skippedRows;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-semibold border transition-colors',
                    active
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300',
                  )}
                >
                  {key === 'ALL' ? 'All' : STATUS_STYLE[key].label} · {count}
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-start">Row</th>
                  <th className="px-3 py-2 text-start">Status</th>
                  <th className="px-3 py-2 text-start">SKU</th>
                  <th className="px-3 py-2 text-start">Product</th>
                  <th className="px-3 py-2 text-end">Price</th>
                  <th className="px-3 py-2 text-end">Quantity</th>
                  <th className="px-3 py-2 text-start">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleRows.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-xs text-gray-400">No rows in this view.</td></tr>
                ) : visibleRows.map((row) => {
                  const style = STATUS_STYLE[row.status];
                  return (
                    <tr key={row.rowNumber} className="hover:bg-gray-50/60 align-top">
                      <td className="px-3 py-2 font-mono text-xs text-gray-500">{row.rowNumber}</td>
                      <td className="px-3 py-2">
                        <span className={cn('inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase', style.bg, style.text)}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-700">{row.sku ?? '—'}</td>
                      <td className="px-3 py-2 text-xs text-gray-700 max-w-[14ch] truncate">
                        {row.productName ?? <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-3 py-2 text-end font-mono text-xs">
                        <PriceCell oldValue={row.oldPrice} newValue={row.price} rawValue={row.rawPrice} />
                      </td>
                      <td className="px-3 py-2 text-end font-mono text-xs">
                        <QtyCell oldValue={row.oldQuantity} newValue={row.quantity} rawValue={row.rawQuantity} />
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {row.errors.length > 0 && (
                          <ul className="space-y-0.5">
                            {row.errors.map((e, i) => (
                              <li key={i} className="text-red-700">• {e}</li>
                            ))}
                          </ul>
                        )}
                        {row.warnings.length > 0 && (
                          <ul className="space-y-0.5">
                            {row.warnings.map((w, i) => (
                              <li key={i} className="text-amber-700">• {w}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button variant="ghost" onClick={cancelImport} disabled={applying}>
              Cancel import
            </Button>
            <Button
              onClick={confirmApply}
              loading={applying}
              disabled={validRows.length === 0}
            >
              <CheckCircle2 className="h-4 w-4" />
              {validRows.length === 0
                ? 'Nothing to apply'
                : `Apply ${validRows.length} valid row${validRows.length === 1 ? '' : 's'}`}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </section>
      )}

      {/* Step 4 — Result */}
      {result && (
        <section className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h2 className="font-semibold text-gray-900">4. Update applied</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <SummaryTile label="Applied"    value={result.appliedCount}    tone="green" />
            <SummaryTile label="Skipped"    value={result.skipped.length}  tone="amber" />
            <SummaryTile label="Batch ID"   value={result.batchId.slice(0, 8)} tone="gray" mono />
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Every change is recorded in the audit log under batch{' '}
              <code className="font-mono">{result.batchId}</code>.
            </p>
          </div>

          {result.rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-start">SKU</th>
                    <th className="px-3 py-2 text-start">Product</th>
                    <th className="px-3 py-2 text-end">Price</th>
                    <th className="px-3 py-2 text-end">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {result.rows.map((row) => (
                    <tr key={row.sku} className="align-top">
                      <td className="px-3 py-2 font-mono text-xs text-gray-700">{row.sku}</td>
                      <td className="px-3 py-2 text-xs text-gray-700 max-w-[18ch] truncate">{row.productName ?? '—'}</td>
                      <td className="px-3 py-2 text-end font-mono text-xs">
                        <Diff
                          oldVal={formatPrice(row.oldPrice)}
                          newVal={formatPrice(row.newPrice)}
                          changed={row.priceChanged}
                        />
                      </td>
                      <td className="px-3 py-2 text-end font-mono text-xs">
                        <Diff
                          oldVal={String(row.oldQuantity)}
                          newVal={String(row.newQuantity)}
                          changed={row.quantityChanged}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.skipped.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">
                {result.skipped.length} row(s) skipped at apply time
              </p>
              <ul className="text-xs text-amber-700 space-y-0.5">
                {result.skipped.map((s, i) => (
                  <li key={i}>
                    <code className="font-mono">{s.sku || '—'}</code> · {s.reason}
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

function SummaryTile({
  label, value, tone, mono,
}: {
  label: string;
  value: number | string;
  tone: 'gray' | 'green' | 'red' | 'amber';
  mono?: boolean;
}) {
  const styles =
    tone === 'green' ? 'border-green-100 bg-green-50 text-green-700'
    : tone === 'red' ? 'border-red-100 bg-red-50 text-red-700'
    : tone === 'amber' ? 'border-amber-100 bg-amber-50 text-amber-700'
    : 'border-gray-100 bg-gray-50 text-gray-700';
  return (
    <div className={cn('rounded-xl border p-3', styles)}>
      <p className="text-[11px] uppercase tracking-wide opacity-70">{label}</p>
      <p className={cn('text-2xl font-bold mt-1', mono && 'font-mono text-base')}>{value}</p>
    </div>
  );
}

function PriceCell({
  oldValue, newValue, rawValue,
}: { oldValue: number | null; newValue: number | null; rawValue: string | null }) {
  if (newValue == null && (rawValue == null || rawValue === '')) {
    return (
      <span className="text-gray-400">
        {oldValue != null ? <>keep <span className="text-gray-500">{formatPrice(oldValue)}</span></> : '—'}
      </span>
    );
  }
  if (newValue == null) {
    return <span className="text-red-600">{rawValue}</span>;
  }
  if (oldValue == null) return <span className="text-gray-700">{formatPrice(newValue)}</span>;
  const changed = oldValue !== newValue;
  return (
    <span className={cn('inline-flex items-center gap-1 justify-end', changed ? 'text-green-700' : 'text-gray-500')}>
      <span className="text-gray-400 line-through">{formatPrice(oldValue)}</span>
      <ArrowRight className="h-3 w-3 rtl:rotate-180" />
      <span className="font-semibold">{formatPrice(newValue)}</span>
    </span>
  );
}

function QtyCell({
  oldValue, newValue, rawValue,
}: { oldValue: number | null; newValue: number | null; rawValue: string | null }) {
  if (newValue == null && (rawValue == null || rawValue === '')) {
    return (
      <span className="text-gray-400">
        {oldValue != null ? <>keep <span className="text-gray-500">{oldValue}</span></> : '—'}
      </span>
    );
  }
  if (newValue == null) {
    return <span className="text-red-600">{rawValue}</span>;
  }
  if (oldValue == null) return <span className="text-gray-700">{newValue}</span>;
  const changed = oldValue !== newValue;
  return (
    <span className={cn('inline-flex items-center gap-1 justify-end', changed ? 'text-green-700' : 'text-gray-500')}>
      <span className="text-gray-400 line-through">{oldValue}</span>
      <ArrowRight className="h-3 w-3 rtl:rotate-180" />
      <span className="font-semibold">{newValue}</span>
    </span>
  );
}

function Diff({ oldVal, newVal, changed }: { oldVal: string; newVal: string; changed: boolean }) {
  if (!changed) {
    return (
      <span className="text-gray-500 inline-flex items-center gap-1">
        <MinusCircle className="h-3 w-3 text-gray-300" /> {newVal}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-green-700 justify-end">
      <span className="text-gray-400 line-through">{oldVal}</span>
      <ArrowRight className="h-3 w-3 rtl:rotate-180" />
      <span className="font-semibold">{newVal}</span>
    </span>
  );
}
