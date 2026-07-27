import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  Building2,
  Layers,
  DoorOpen,
  Info,
  ScanLine,
  Construction,
  Search,
  X,
} from 'lucide-react';
import { CONSTRUCTION_OBJECTS } from '@/data/mockData';
import { YandexMap } from '@/components/ui/YandexMap';
import type { ConstructionObject } from '@/types';

interface ObjectSelectionScreenProps {
  onBack: () => void;
  onLaunchScanner: (objectId: string, block: string, floor: string, room: string) => void;
  initialObjectId?: string;
  initialBlock?: string;
  initialFloor?: string;
  initialRoom?: string;
}

export function ObjectSelectionScreen({
  onBack,
  onLaunchScanner,
  initialObjectId,
  initialBlock = '',
  initialFloor = '',
  initialRoom = '',
}: ObjectSelectionScreenProps) {
  const [query, setQuery] = useState('');
  const [selectedObject, setSelectedObject] = useState<ConstructionObject | null>(() =>
    initialObjectId ? CONSTRUCTION_OBJECTS.find((o) => o.id === initialObjectId) ?? null : null,
  );
  const [block, setBlock] = useState(initialBlock);
  const [floor, setFloor] = useState(initialFloor);
  const [room, setRoom] = useState(initialRoom);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CONSTRUCTION_OBJECTS.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q),
    );
  }, [query]);

  const showSearchResults = query.trim().length > 0;
  const canLaunch = !!selectedObject && block.trim() && floor.trim() && room.trim();

  const handleSelectObject = (obj: ConstructionObject) => {
    setSelectedObject(obj);
    setQuery('');
    setBlock('');
    setFloor('');
    setRoom('');
  };

  const handleChangeObject = () => {
    setSelectedObject(null);
    setBlock('');
    setFloor('');
    setRoom('');
  };

  return (
    <div className="min-h-full pb-28 animate-fade-in">
      {/* Top panel */}
      <header className="sticky top-0 z-30 glass border-b border-white/40">
        <div className="px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-surface-bright border border-line-soft shadow-card grid place-items-center text-ink btn-press"
            aria-label="Назад"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold tracking-[0.16em] text-ink-subtle uppercase">
              SapaScan
            </div>
            <div className="text-title-sm text-ink font-display truncate">
              Выбор объекта сканирования
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-white font-bold text-sm shadow-glow shrink-0">
            МТ
          </div>
        </div>
      </header>

      {/* Search bar + floating results — map stays visible underneath */}
      <section className="px-4 mt-4 relative z-20">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите название ЖК или здания BI Group"
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-surface-bright border border-line-soft text-body-md text-ink placeholder:text-ink-faint shadow-card focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-surface-low grid place-items-center text-ink-subtle hover:text-ink btn-press"
              aria-label="Очистить"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Floating search results overlay */}
        {showSearchResults && (
          <div className="absolute left-4 right-4 top-full mt-2 rounded-2xl bg-surface-bright border border-line-soft shadow-float overflow-hidden animate-slide-up">
            {searchResults.length > 0 ? (
              <div className="max-h-72 overflow-y-auto divide-y divide-line-soft">
                {searchResults.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => handleSelectObject(obj)}
                    className="w-full flex items-center gap-3 p-3.5 hover:bg-surface-low transition-colors text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-brand-50 grid place-items-center shrink-0">
                      <Construction size={20} className="text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-body-md font-semibold text-ink truncate">{obj.name}</div>
                      <div className="flex items-center gap-1 text-[12px] text-ink-muted mt-0.5">
                        <MapPin size={11} className="text-ink-faint shrink-0" />
                        <span className="truncate">{obj.city}, {obj.district}, {obj.address}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-ink-faint shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-low grid place-items-center">
                  <Search size={22} className="text-ink-faint" />
                </div>
                <div className="text-body-md text-ink-subtle font-medium">Ничего не найдено</div>
                <div className="text-[12px] text-ink-faint">Попробуйте изменить запрос</div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Interactive map — always visible, shows all BI Group objects */}
      <section className="px-4 mt-4">
        <YandexMap
          className="h-64"
          objects={CONSTRUCTION_OBJECTS}
          selectedId={selectedObject?.id ?? ''}
          onSelect={(id) => {
            const obj = CONSTRUCTION_OBJECTS.find((o) => o.id === id);
            if (obj) handleSelectObject(obj);
          }}
        />
        {!selectedObject && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[12px] text-ink-subtle">
            <MapPin size={13} className="text-brand" />
            Найдите объект на карте или через поиск выше
          </div>
        )}
      </section>

      {/* Selected object — info card + manual inputs + launch */}
      {selectedObject && (
        <>
          {/* Object info card */}
          <section className="px-4 mt-4">
            <div className="card-soft p-4 animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-subtle uppercase tracking-wide">
                    <Construction size={13} className="text-brand" />
                    Выбранный объект
                  </div>
                  <h2 className="text-display-md font-display text-ink mt-1">{selectedObject.name}</h2>
                  <div className="flex items-center gap-1.5 text-body-sm text-ink-muted mt-1">
                    <MapPin size={14} className="text-ink-subtle" />
                    {selectedObject.city}, {selectedObject.district}
                  </div>
                </div>
                <button
                  onClick={handleChangeObject}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-low text-ink-subtle text-[11px] font-semibold hover:bg-surface-high transition-colors"
                >
                  Изменить
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <MiniStat value={String(selectedObject.unitsScanned)} label="Сканировано" />
                <MiniStat value={String(selectedObject.defectsOpen)} label="Открытых дефектов" tone="warn" />
                <MiniStat value={selectedObject.status === 'active' ? 'Активен' : 'Punch'} label="Статус" />
              </div>
            </div>
          </section>

          {/* Manual text inputs */}
          <section className="px-4 mt-4 space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-ink-subtle uppercase">
                Параметры сканирования
              </span>
              <span className="h-px flex-1 bg-line-soft" />
            </div>

            <TextInput
              label="Блок / Здание"
              icon={<Building2 size={18} />}
              value={block}
              onChange={setBlock}
              placeholder="Например: Блок В"
            />
            <TextInput
              label="Этаж"
              icon={<Layers size={18} />}
              value={floor}
              onChange={setFloor}
              placeholder="Например: 4 этаж"
            />
            <TextInput
              label="Квартира / Помещение"
              icon={<DoorOpen size={18} />}
              value={room}
              onChange={setRoom}
              placeholder="Например: Квартира №45"
            />

            {/* Substrate info */}
            {selectedObject.hasSubstrate && (
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-brand-50 border border-brand-100">
                <div className="w-8 h-8 rounded-lg bg-brand/10 grid place-items-center shrink-0">
                  <Info size={16} className="text-brand" />
                </div>
                <div className="text-body-sm text-ink-soft">
                  По данному объекту доступна актуальная подложка от {selectedObject.substrateDate}. AR-сканирование будет привязано к координатной сетке здания.
                </div>
              </div>
            )}
          </section>

          {/* Launch button */}
          <section className="px-4 mt-5">
            <button
              onClick={() => onLaunchScanner(selectedObject.id, block.trim(), floor.trim(), room.trim())}
              disabled={!canLaunch}
              className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 shadow-card-hover btn-press disabled:opacity-40 disabled:shadow-card transition-opacity"
            >
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-center justify-center gap-3 text-white">
                <ScanLine size={22} strokeWidth={2.3} />
                <span className="text-title-md font-display">Запустить AR-Сканер</span>
                <ChevronRight size={20} className="opacity-80" />
              </div>
              <div className="relative text-center text-white/70 text-[11px] mt-1">
                {canLaunch
                  ? `${selectedObject.name} · ${block.trim()} · ${floor.trim()} · ${room.trim()}`
                  : 'Заполните все поля для запуска'}
              </div>
            </button>
          </section>
        </>
      )}
    </div>
  );
}

function MiniStat({
  value,
  label,
  tone = 'default',
}: {
  value: string;
  label: string;
  tone?: 'default' | 'warn';
}) {
  return (
    <div className="rounded-xl bg-surface-low p-2.5 text-center">
      <div
        className={`text-title-md font-display ${
          tone === 'warn' ? 'text-warn-deep' : 'text-ink'
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-ink-subtle mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

function TextInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-ink-subtle uppercase mb-1.5 px-1">
        <span className="text-brand">{icon}</span>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-2xl bg-surface-bright border border-line-soft text-body-md text-ink placeholder:text-ink-faint shadow-card focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
      />
    </div>
  );
}
