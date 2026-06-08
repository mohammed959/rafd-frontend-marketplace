'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  showHandle?: boolean;
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  showHandle = true,
  children,
  className,
  maxHeight = '90vh',
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-sheet bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="sheet-panel"
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-sheet flex flex-col rounded-t-3xl bg-white shadow-sheet',
              className
            )}
            style={{ maxHeight }}
          >
            {showHandle && (
              <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                <div className="h-1 w-10 rounded-full bg-gray-300" />
              </div>
            )}
            {title && (
              <div className="flex items-center justify-between border-b px-5 py-3 shrink-0">
                <h2 className="font-bold text-gray-900 text-base">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
