import { ArrowRight, Scan, Ruler, ShieldCheck, Activity, Sparkles, Lock } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface HomeScreenProps {
  onStartScan: () => void;
}

export function HomeScreen({ onStartScan }: HomeScreenProps) {
  return (
    <div className="min-h-full pb-28 animate-fade-in">
      {/* Top bar */}
      <header className="px-5 pt-[max(18px,env(safe-area-inset-top))] pb-3 flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-bright border border-line-soft shadow-card">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-ok opacity-60 animate-pulse-ring" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ok" />
          </span>
          <span className="text-[11px] font-semibold text-ink-muted">Online</span>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[11px] font-semibold tracking-wide mb-4">
          <Sparkles size={12} strokeWidth={2.5} />
          Версия 2.4 · LIDAR AI Engine
        </div>
        <h1 className="text-display-lg font-display text-ink text-balance">
          Измеряй. <span className="text-brand">Находи.</span> Защищай.
        </h1>
        <p className="text-body-md text-ink-muted mt-3 max-w-sm">
          Интеллектуальный контроль качества и мониторинг объектов в режиме реального времени.
        </p>
      </section>

      {/* AR preview */}
      <section className="px-5 mt-6">
        <ArPreview />
      </section>

      {/* Action cards */}
      <section className="px-5 mt-5 space-y-3">
        <button
          onClick={onStartScan}
          className="group w-full text-left relative overflow-hidden rounded-card bg-gradient-to-br from-brand-500 to-brand-700 p-5 shadow-card-hover btn-press"
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-4 bottom-4 w-24 h-24 rounded-full border border-white/20" />
          <div className="absolute right-9 bottom-9 w-14 h-14 rounded-full border border-white/15" />
          <div className="relative flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur grid place-items-center mb-3 border border-white/20">
                <Scan size={22} className="text-white" strokeWidth={2.2} />
              </div>
              <div className="text-title-md text-white font-display">Live AR Сканирование</div>
              <div className="text-body-sm text-white/80 mt-1">
                Поиск дефектов и рисков с ИИ
              </div>
            </div>
            <ArrowRight
              size={20}
              className="text-white/80 mt-1 group-hover:translate-x-1 transition-transform shrink-0"
            />
          </div>
        </button>
      </section>

      {/* Stats strip */}
      <section className="px-5 mt-5">
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile icon={<Activity size={16} />} value="142" label="Регламентов" />
          <StatTile icon={<ShieldCheck size={16} />} value="96.2%" label="Точность ИИ" />
          <StatTile icon={<Scan size={16} />} value="3.2k" label="Сканирований" />
        </div>
      </section>

      {/* System status bar */}
      <section className="px-5 mt-5">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-ink text-white/90 shadow-card">
          <span className="relative flex w-2.5 h-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-ok opacity-50 animate-pulse-ring" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ok" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-body-sm font-medium text-white">
              Система синхронизирована с базами регламентов BI Group
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              Последнее обновление · 22.07.2026 · 14:02
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card-soft p-3 text-center">
      <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand grid place-items-center mx-auto mb-1.5">
        {icon}
      </div>
      <div className="text-title-sm text-ink font-display">{value}</div>
      <div className="text-[11px] text-ink-subtle mt-0.5">{label}</div>
    </div>
  );
}

function ArPreview() {
  return (
    <div className="relative rounded-card overflow-hidden shadow-card border border-line-soft aspect-[4/3] bg-ink">
      {/* construction backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/room-scan.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/30" />

      {/* perspective grid */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 scan-mesh-floor perspective-grid opacity-70" />

      {/* scanning line */}
      <div className="absolute inset-x-0 top-0 h-px bg-brand shadow-glow animate-scan-line" />

      {/* status chips */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-dark text-white text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse-dot" />
        LIDAR ACTIVE
      </div>
      

      {/* defect markers */}
      <PreviewMarker type="danger" style={{ left: '22%', top: '38%' }} />
      <PreviewMarker type="warn" style={{ left: '62%', top: '58%' }} />

      {/* footer label */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="px-2.5 py-1 rounded-lg glass-dark text-white text-[11px] font-medium">
          ЖК Verdi · Блок В · Кв. 16
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-brand text-white text-[11px] font-semibold shadow-glow">
          2 дефекта
        </div>
      </div>
    </div>
  );
}

function PreviewMarker({
  type,
  style,
}: {
  type: 'danger' | 'warn';
  style: React.CSSProperties;
}) {
  const isDanger = type === 'danger';
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={style}>
      <div
        className={`w-7 h-7 rounded-full grid place-items-center text-white text-xs font-bold border-2 border-white shadow-lg ${
          isDanger ? 'bg-danger animate-marker-bob' : 'bg-warn animate-marker-bob'
        }`}
        style={{ animationDelay: isDanger ? '0s' : '0.6s' }}
      >
        !
      </div>
      {isDanger && (
        <div className="absolute inset-0 rounded-full bg-danger/40 animate-pulse-ring" />
      )}
    </div>
  );
}
