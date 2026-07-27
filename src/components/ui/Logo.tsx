import { ScanLine } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  onDark?: boolean;
}

const sizeMap = {
  sm: { box: 'w-7 h-7', icon: 16, text: 'text-title-sm' },
  md: { box: 'w-9 h-9', icon: 20, text: 'text-display-md' },
  lg: { box: 'w-12 h-12', icon: 26, text: 'text-display-lg' },
};

export function Logo({ size = 'md', showWordmark = true, className = '', onDark = false }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${s.box} rounded-xl bg-brand grid place-items-center shadow-glow shrink-0 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-700" />
        <ScanLine size={s.icon} className="text-white relative z-10" strokeWidth={2.4} />
      </div>
      {showWordmark && (
        <div className="leading-none">
          <div
            className={`${s.text} font-display font-extrabold tracking-tight ${
              onDark ? 'text-white' : 'text-ink'
            }`}
          >
            Sapa<span className="text-brand">Scan</span>
          </div>
          {size !== 'sm' && (
            <div
              className={`text-[10px] font-semibold tracking-[0.22em] mt-1 ${
                onDark ? 'text-white/60' : 'text-ink-subtle'
              }`}
            >
              BY BI GROUP
            </div>
          )}
        </div>
      )}
    </div>
  );
}
