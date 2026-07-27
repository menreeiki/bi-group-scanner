import { useState } from 'react';
import {
  Search,
  MapPin,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  CircleSlash,
} from 'lucide-react';
import { CONSTRUCTION_OBJECTS } from '@/data/mockData';
import { useScanReports } from '@/hooks/useScanReports';
import type { ScanReport } from '@/types';
import { Sheet } from '@/components/ui/Sheet';

interface ProjectsScreenProps {
  onOpenObject: (objectId: string) => void;
}

export function ProjectsScreen({ onOpenObject }: ProjectsScreenProps) {
  const [view, setView] = useState<'objects' | 'reports'>('objects');
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-full pb-28 animate-fade-in">
      <header className="px-5 pt-[max(18px,env(safe-area-inset-top))] pb-2">
        <h1 className="text-display-md font-display text-ink">Проекты</h1>
        <p className="text-body-sm text-ink-muted mt-1">
          Объекты BI Group и отчёты сканирований
        </p>
      </header>

      {/* segmented control */}
      <div className="px-5 mt-3">
        <div className="flex p-1 rounded-2xl bg-surface-low border border-line-soft">
          <SegButton active={view === 'objects'} onClick={() => setView('objects')}>
            Объекты
          </SegButton>
          <SegButton active={view === 'reports'} onClick={() => setView('reports')}>
            Отчёты
          </SegButton>
        </div>
      </div>

      {/* search */}
      <div className="px-5 mt-3">
        <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl bg-surface-bright border border-line-soft shadow-card">
          <Search size={18} className="text-ink-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск объекта или отчёта…"
            className="flex-1 bg-transparent outline-none text-body-md text-ink placeholder:text-ink-faint"
          />
        </div>
      </div>

      {view === 'objects' ? (
        <ObjectsList query={query} onOpenObject={onOpenObject} />
      ) : (
        <ReportsList query={query} />
      )}
    </div>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl text-body-md font-semibold transition-all btn-press ${
        active ? 'bg-surface-bright text-ink shadow-card' : 'text-ink-subtle hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function ObjectsList({
  query,
  onOpenObject,
}: {
  query: string;
  onOpenObject: (id: string) => void;
}) {
  const filtered = CONSTRUCTION_OBJECTS.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase()),
  );

  if (filtered.length === 0) {
    return <EmptyState text="Объекты не найдены" />;
  }

  return (
    <div className="px-5 mt-4 space-y-3">
      {filtered.map((obj) => (
        <button
          key={obj.id}
          onClick={() => onOpenObject(obj.id)}
          className="w-full text-left card-soft p-4 btn-press hover:shadow-card-hover transition-shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-title-md text-ink font-display">{obj.name}</div>
              <div className="flex items-center gap-1.5 text-body-sm text-ink-muted mt-1">
                <MapPin size={13} className="text-ink-subtle" />
                {obj.city}, {obj.address}
              </div>
            </div>
            <ChevronRight size={18} className="text-ink-faint shrink-0 mt-1" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <MiniStat value={String(obj.unitsScanned)} label="Сканировано" />
            <MiniStat value={String(obj.defectsOpen)} label="Дефектов" tone="warn" />
            <MiniStat value={obj.blocks.length.toString()} label="Блоков" />
          </div>
        </button>
      ))}
    </div>
  );
}

function ReportsList({ query }: { query: string }) {
  const {
    reports,
    loading,
    error,
    refresh,
    updateStatus,
    deleteReport,
  } = useScanReports();

  const [selectedReport, setSelectedReport] =
    useState<ScanReport | null>(null);

  const filtered = reports.filter(
    (r) =>
      r.reportId.toLowerCase().includes(query.toLowerCase()) ||
      r.objectName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <div className="px-5 mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-subtle uppercase">
            {reports.length} отчётов
          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-bright border border-line-soft text-ink-muted text-[11px] font-semibold btn-press"
          >
            <RefreshCw
              size={12}
              className={loading ? "animate-spin" : ""}
            />
            Обновить
          </button>
        </div>

        {loading && reports.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-ink-subtle">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Загрузка отчётов…
          </div>
        ) : error ? (
          <div className="card-soft p-4 text-danger-deep text-body-sm">
            Ошибка загрузки: {error}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState text="Отчётов пока нет. Запустите AR-сканер." />
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="cursor-pointer"
              onClick={() => setSelectedReport(r)}
            >
              <ReportCard report={r} />
            </div>
          ))
        )}
      </div>

      <Sheet
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        maxWidth="lg"
      >
        {selectedReport && (
          <div className="p-5 max-h-[85vh] overflow-y-auto no-scrollbar">

            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-brand text-white">
                ОТЧЁТ {selectedReport.reportId}
              </span>
            </div>

            <h2 className="text-display-md font-display text-ink">
              ЖК {selectedReport.objectName}
            </h2>
            
           <div className="text-body-sm text-ink-muted mt-1">
              {[
                selectedReport.blockName ? `Блок ${selectedReport.blockName}` : '',
                selectedReport.floorName ? `Этаж ${selectedReport.floorName}` : '',
                selectedReport.roomName ? `Кв. ${selectedReport.roomName}` : '',
              ]
                .filter(Boolean)
                .join(' • ')}
            </div>

            {selectedReport.image && (
              <div className="relative rounded-2xl overflow-hidden my-4 border border-line-soft shadow-sm">
                <img
                  src={selectedReport.image}
                  alt="Снимок"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

           {selectedReport.defects && selectedReport.defects.length > 0 ? (
  <div className="mt-4 space-y-3">
    <div className="text-[11px] font-semibold tracking-wider text-ink-subtle uppercase">
      Зафиксированные проблемы ({selectedReport.defects.length})
    </div>

    {selectedReport.defects.map((defect: any, idx: number) => (
      <div
        key={idx}
        className="p-3.5 rounded-xl bg-surface-low border border-line-soft"
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-ink text-body-md">
            {defect.title}
          </span>

          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-danger/10 text-danger">
            {defect.code}
          </span>
        </div>

        <p className="text-body-sm text-ink-soft mt-1">
          {defect.description}
        </p>

        {defect.regulation && (
          <div className="text-[11px] text-ink-muted mt-2 pt-2 border-t border-line-soft">
            Регламент: {defect.regulation}
          </div>
        )}
      </div>
    ))}
  </div>
) : (
  <div className="mt-4 text-center py-6 text-ink-subtle text-body-sm">
    Список деталей дефектов пуст
  </div>
)}

{/* ---------- СТАТУС ОТЧЕТА (Только кнопка "Устранено") ---------- */}

{selectedReport.status === "resolved" ? (
  <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 p-4 text-center">
    <div className="text-green-700 font-semibold text-lg">
      ✓ Дефект устранен
    </div>
  </div>
) : (
  <div className="mt-6">
    <button
      onClick={async () => {
        await updateStatus(selectedReport.id, "resolved");
        setSelectedReport({
          ...selectedReport,
          status: "resolved",
        });
      }}
      className="w-full py-3.5 px-4 rounded-xl bg-green-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
    >
      <span>🟢</span>
      <span>Устранено</span>
    </button>
  </div>
)}

           <button
  onClick={() => setSelectedReport(null)}
  className="mt-6 w-full py-3 rounded-xl bg-surface-low text-ink font-semibold text-body-md btn-press"
>
  Закрыть
</button>

<button
  onClick={async () => {
    if (confirm("Удалить этот отчет?")) {
      await deleteReport(selectedReport.id);
      setSelectedReport(null);
    }
  }}
  className="mt-3 w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
>
  Удалить отчет
</button>
          </div>
        )}
      </Sheet>
    </>
  );
}

function ReportCard({ report }: { report: ScanReport }) {
  const statusMeta = {
    draft: {
      label: "Черновик",
      cls: "bg-surface-high text-ink-muted",
      icon: Clock,
    },
    issued: {
      label: "В работе",
      cls: "bg-blue-100 text-blue-700",
      icon: FileText,
    },
    resolved: {
      label: "Устранено",
      cls: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    },
  }[report.status];

  const StatusIcon = statusMeta.icon;

  // Собираем данные блока, этажа и квартиры
  const details = [];
  if (report.blockName) details.push(`Блок ${report.blockName}`);
  if (report.floorName) details.push(`Этаж ${report.floorName}`);
  if (report.roomName) details.push(`Кв. ${report.roomName}`);
  
  let subText = details.join(', ');
  
  // Если детальных полей нет, пробуем извлечь из objectLabel аккуратно
  if (!subText && report.objectLabel) {
    const clean = report.objectLabel.replace(new RegExp(`^${escapeRegExp(report.objectName)}[\\s•\\-\\–]*`, 'i'), '').trim();
    if (clean && clean.toLowerCase() !== report.objectName.toLowerCase()) {
      subText = clean.length === 1 ? `Блок ${clean}` : clean;
    }
  }

  return (
    <div className="card-soft p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-ink">{report.reportId}</div>
          {/* Название ЖК с префиксом и более насыщенным шрифтом */}
          <div className="text-sm font-semibold text-ink mt-0.5 truncate">
            ЖК {report.objectName}
          </div>
          {/* Блок / Этаж / Квартира */}
          {subText && (
            <div className="text-xs text-ink-muted mt-0.5 truncate">
              {subText}
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs shrink-0 ${statusMeta.cls}`}
        >
          <StatusIcon size={12} />
          {statusMeta.label}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <MiniStat value={String(report.defectCount)} label="Всего" />
        <MiniStat value={String(report.highRiskCount)} label="Высокий" tone="danger" />
        <MiniStat value={String(report.mediumRiskCount)} label="Средний" tone="warn" />
      </div>
    </div>
  );
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function MiniStat({
  value,
  label,
  tone = 'default',
}: {
  value: string;
  label: string;
  tone?: 'default' | 'warn' | 'danger';
}) {
  const color =
    tone === 'danger' ? 'text-danger-deep' : tone === 'warn' ? 'text-warn-deep' : 'text-ink';
  return (
    <div className="rounded-xl bg-surface-low p-2.5 text-center">
      <div className={`text-title-md font-display ${color}`}>{value}</div>
      <div className="text-[10px] text-ink-subtle mt-0.5">{label}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-low grid place-items-center text-ink-faint">
        <CircleSlash size={24} />
      </div>
      <div className="text-body-md text-ink-subtle">{text}</div>
    </div>
  );
}