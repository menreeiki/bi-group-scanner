import { useState } from 'react';
import {
  Bell,
  ShieldCheck,
  Database,
  Info,
  ChevronRight,
  ScanLine,
  Zap,
  Globe,
  Moon,
  HelpCircle,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import standardsPdf from '@/bi_group_standards.pdf';

export function SettingsScreen() {
  const [isOpen, setIsOpen] = useState(false);

  // Если нажали на регламент — показываем PDF во весь экран
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
          <button 
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-surface-low rounded-xl font-semibold text-ink hover:bg-border transition-colors"
          >
            ← Назад
          </button>
          <h2 className="font-bold text-ink text-base">Регламенты BI Group</h2>
          <div className="w-16" />
        </div>
        <iframe src={standardsPdf} className="w-full flex-1" title="Регламент PDF" />
      </div>
    );
  }

  return (
    <div className="min-h-full pb-28 animate-fade-in">
      <header className="px-5 pt-[max(18px,env(safe-area-inset-top))] pb-2">
        <h1 className="text-display-md font-display text-ink">Настройки</h1>
        <p className="text-body-sm text-ink-muted mt-1">Конфигурация SapaScan</p>
      </header>

      {/* Profile card */}
      <section className="px-5 mt-4">
        <div className="card-soft p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-white font-bold text-lg shadow-glow shrink-0">
            МТ
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-title-md text-ink font-display">Мадина Тулегенова</div>
            <div className="text-body-sm text-ink-muted">Инженер контроля качества</div>
            <div className="text-[11px] text-ink-subtle mt-0.5">BI Group · Алматы</div>
          </div>
        </div>
      </section>

      {/* AI module status */}
      <section className="px-5 mt-4">
        <div className="rounded-2xl bg-gradient-to-br from-ink to-ink-soft p-4 text-white shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand grid place-items-center shadow-glow">
              <Zap size={16} />
            </div>
            <div>
              <div className="text-title-sm font-display">AI Vision Engine</div>
              <div className="text-[11px] text-white/60">Модуль анализа дефектов</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <DarkStat value="v2.4" label="Версия" />
            <DarkStat value="96.2%" label="Точность" />
            <DarkStat value="142" label="Регламентов" />
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11px] text-ok">
            <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse-dot" />
            Модуль активен и синхронизирован
          </div>
        </div>
      </section>

      {/* Settings groups */}
      <section className="px-5 mt-4 space-y-4">
        <SettingsGroup title="Интерфейс">
          <SettingsRow
            icon={<Bell size={18} />}
            label="Уведомления о дефектах"
            toggle
            defaultOn
          />
          <SettingsRow
            icon={<Moon size={18} />}
            label="Тёмная тема камеры"
            toggle
            defaultOn
          />
          <SettingsRow
            icon={<Globe size={18} />}
            label="Язык"
            value="Русский"
            chevron
          />
        </SettingsGroup>

        <SettingsGroup title="О приложении">
          {/* Клик на регламенты теперь открывает PDF */}
          <div onClick={() => setIsOpen(true)} className="cursor-pointer">
            <SettingsRow
              icon={<ShieldCheck size={18} />}
              label="Регламенты BI Group"
              value="v4.2"
              chevron
            />
          </div>
          <SettingsRow
            icon={<Info size={18} />}
            label="Версия SapaScan"
            value="2.4.1"
          />
         <div onClick={() => alert('Служба поддержки: 8 (775) 789-59-22')} className="cursor-pointer">
  <SettingsRow
    icon={<HelpCircle size={18} />}
    label="Поддержка"
    value="Связаться"
    chevron
  />
</div>
        </SettingsGroup>
      </section>

      <section className="px-5 mt-6">
        <Logo size="md" className="opacity-40 justify-center" />
        <div className="text-center text-[11px] text-ink-faint mt-2">
          © 2026 BI Group · SapaScan
        </div>
      </section>
    </div>
  );
}

function DarkStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-2.5 text-center border border-white/10">
      <div className="text-title-md font-display text-white">{value}</div>
      <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
    </div>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-subtle uppercase mb-2 px-1">
        {title}
      </div>
      <div className="card-soft divide-y divide-line-soft overflow-hidden">{children}</div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  hint,
  value,
  chevron,
  toggle,
  defaultOn = false,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  value?: string;
  chevron?: boolean;
  toggle?: boolean;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-9 h-9 rounded-xl bg-surface-low grid place-items-center text-brand shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-body-md text-ink font-medium">{label}</div>
        {hint && <div className="text-[11px] text-ink-subtle">{hint}</div>}
      </div>
      {value && <div className="text-body-sm text-ink-muted">{value}</div>}
      {chevron && <ChevronRight size={18} className="text-ink-faint" />}
      {toggle && <Toggle on={on} onClick={() => setOn(!on)} />}
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors btn-press ${
        on ? 'bg-brand' : 'bg-surface-high'
      }`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-card transition-transform ${
          on ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}
