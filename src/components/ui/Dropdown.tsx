import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  id: string;
  name: string;
  hint?: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (id: string) => void;
  icon?: React.ReactNode;
}

export function Dropdown({ label, options, value, onChange, icon }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border btn-press transition-colors ${
          open
            ? 'border-brand bg-brand-50/60 ring-2 ring-brand/15'
            : 'border-line bg-surface-bright hover:border-brand-200'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 text-left">
          {icon && <span className="text-brand shrink-0">{icon}</span>}
          <div className="min-w-0">
            <div className="text-[10px] font-semibold tracking-[0.14em] text-ink-subtle uppercase">
              {label}
            </div>
            <div className="text-title-sm text-ink truncate">{selected?.name ?? '—'}</div>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-ink-subtle transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-2 card-soft shadow-float p-1.5 animate-pop-in origin-top">
          {options.map((o) => {
            const isSel = o.id === value;
            return (
              <button
                key={o.id}
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl btn-press transition-colors ${
                  isSel ? 'bg-brand-50 text-brand-600' : 'hover:bg-surface-low text-ink'
                }`}
              >
                <div className="text-left min-w-0">
                  <div className="text-body-md font-medium truncate">{o.name}</div>
                  {o.hint && <div className="text-[11px] text-ink-subtle truncate">{o.hint}</div>}
                </div>
                {isSel && <Check size={16} className="text-brand shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
