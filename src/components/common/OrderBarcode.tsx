'use client';
import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

type Variant = 'default' | 'compact';

interface Props {
  orderNumber: string;
  // SVG width (px). CODE128 scales nicely; defaults are tuned for the
  // customer pickup screen vs. inline list usage.
  width?: number;
  height?: number;
  variant?: Variant;
  className?: string;
  /** Show the order number underneath. Defaults to true. */
  showText?: boolean;
}

/**
 * Reusable order-number barcode. Encodes the order number directly with
 * CODE128 (alphanumeric + dash). Renders as inline SVG so it stays sharp
 * at any size and is cheap to print.
 *
 * If rendering fails (e.g. the orderNumber contains unsupported chars),
 * we fall back to a plain text label so the screen never goes blank.
 */
export function OrderBarcode({
  orderNumber,
  width = 320,
  height = 90,
  variant = 'default',
  className,
  showText = true,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!orderNumber || !svgRef.current) {
      setFailed(true);
      return;
    }
    try {
      // Compute a width-per-bar that keeps the barcode within the requested
      // pixel width. CODE128 of a typical order number ~18 chars produces
      // ~200 modules; tune `width` (bar width) accordingly.
      const moduleCount = Math.max(80, orderNumber.length * 11);
      const barWidth = Math.max(1, Math.floor(width / moduleCount * 10) / 10);
      JsBarcode(svgRef.current, orderNumber, {
        format: 'CODE128',
        width: barWidth,
        height,
        margin: variant === 'compact' ? 4 : 10,
        displayValue: false, // we render the value ourselves below the SVG
        background: '#ffffff',
        lineColor: '#000000',
      });
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [orderNumber, width, height, variant]);

  if (failed) {
    return (
      <div className={className} role="img" aria-label={`Order ${orderNumber}`}>
        <p className="text-center font-mono text-sm font-semibold text-gray-900" dir="ltr">
          Order Number: {orderNumber}
        </p>
      </div>
    );
  }

  return (
    <div
      className={className}
      role="img"
      aria-label={`Order barcode for ${orderNumber}`}
    >
      <div className="flex justify-center bg-white">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      {showText && (
        <p
          className={
            variant === 'compact'
              ? 'mt-1 text-center font-mono text-[10px] font-semibold text-gray-700'
              : 'mt-2 text-center font-mono text-sm font-bold tracking-wider text-gray-900'
          }
          dir="ltr"
        >
          {orderNumber}
        </p>
      )}
    </div>
  );
}
