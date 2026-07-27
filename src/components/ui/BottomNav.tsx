import { LayoutGrid, FolderKanban, Settings } from 'lucide-react';

export type TabKey = 'home' | 'projects' | 'settings';

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'home', label: 'Обзор', icon: LayoutGrid },
  { key: 'projects', label: 'Проекты', icon: FolderKanban },
  { key: 'settings', label: 'Настройки', icon: Settings },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-md px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 pointer-events-auto">
        <div className="glass rounded-2xl shadow-float border border-white/60 px-2 py-1.5 flex items-center justify-between">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className={`relative flex-1 flex flex-col items-center gap-1 py-2 rounded-xl btn-press transition-colors ${
                  isActive ? 'text-brand' : 'text-ink-subtle hover:text-ink'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-brand-50" aria-hidden />
                )}
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.4 : 2}
                  className="relative z-10 transition-transform"
                  style={isActive ? { transform: 'translateY(-1px)' } : undefined}
                />
                <span
                  className={`relative z-10 text-[11px] font-semibold tracking-wide ${
                    isActive ? 'text-brand-600' : ''
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
