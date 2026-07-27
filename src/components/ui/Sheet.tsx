import { useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** max width fraction of viewport */
  maxWidth?: 'md' | 'lg';
}

export function Sheet({ open, onClose, children, maxWidth = 'md' }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${
          maxWidth === 'lg' ? 'sm:max-w-lg' : 'sm:max-w-md'
        } bg-surface-bright rounded-t-card sm:rounded-card shadow-float max-h-[88vh] overflow-y-auto no-scrollbar animate-sheet-up sm:animate-pop-in`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full grid place-items-center bg-surface-low hover:bg-surface-high text-ink-muted btn-press"
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
