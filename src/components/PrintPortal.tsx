import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { Button } from './ui';

/**
 * Full screen print preview. On screen it is an overlay with Print and Close.
 * When printing, only the overlay content is printed (see .sr-print-root in index.css).
 */
export function PrintPortal({
  title,
  onClose,
  children,
  labels = { print: 'Print', close: 'Close' },
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  labels?: { print: string; close: string };
}) {
  useEffect(() => {
    document.body.classList.add('sr-print-mode');
    return () => document.body.classList.remove('sr-print-mode');
  }, []);

  return createPortal(
    <div className="sr-print-root fixed inset-0 z-[70] overflow-auto bg-canvas-soft">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-charcoal-100 bg-white px-4 py-3">
        <div className="font-display text-sm font-bold text-charcoal-900">{title}</div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<X size={15} />} onClick={onClose}>
            {labels.close}
          </Button>
          <Button icon={<Printer size={15} />} onClick={() => window.print()}>
            {labels.print}
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-[900px] p-4">{children}</div>
    </div>,
    document.body
  );
}
