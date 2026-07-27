import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { ALMATY_CENTER, YANDEX_MAPS_API_KEY } from '@/data/mockData';
import type { ConstructionObject } from '@/types';

interface YandexMapProps {
  objects: ConstructionObject[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

let loadPromise: Promise<void> | null = null;

function loadYandexMaps(): Promise<void> {
  if (loadPromise) return loadPromise;
  if (typeof window !== 'undefined' && window.ymaps) {
    return Promise.resolve();
  }
  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('ymaps-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Yandex Maps load failed')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'ymaps-script';
    script.type = 'text/javascript';
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_API_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Yandex Maps script failed to load'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export function YandexMap({ objects, selectedId, onSelect, className }: YandexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const placemarksRef = useRef<Map<string, YandexGeoObject>>(new Map());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the map once.
  useEffect(() => {
    let cancelled = false;
    loadYandexMaps()
      .then(() => window.ymaps!.ready())
      .then(() => {
        if (cancelled || !containerRef.current || !window.ymaps) return;
        const map = new window.ymaps.Map(containerRef.current, {
          center: ALMATY_CENTER,
          zoom: 12,
          controls: ['zoomControl'],
        });
        mapRef.current = map;
        setReady(true);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  // (Re)build placemarks whenever objects or selection change.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !window.ymaps) return;

    placemarksRef.current.forEach((pm) => map.geoObjects.remove(pm));
    placemarksRef.current.clear();

    const ymapsApi = window.ymaps;
    if (!ymapsApi) return;

    objects.forEach((obj) => {
      const isSelected = obj.id === selectedId;
      const placemark = new ymapsApi.Placemark(
        obj.coords,
        {
          balloonContentHeader: `<b>${obj.name}</b>`,
          balloonContentBody: `${obj.district}, ${obj.address}`,
          hintContent: obj.name,
        },
        {
          preset: 'islands#homeIcon',
          iconColor: isSelected ? '#007AFF' : '#1A2233',
        },
      );
      placemark.events.add('click', () => onSelect(obj.id));
      map.geoObjects.add(placemark);
      placemarksRef.current.set(obj.id, placemark);
    });
  }, [objects, selectedId, ready, onSelect]);

  // Re-center to the selected object.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const selected = objects.find((o) => o.id === selectedId);
    if (selected) map.setCenter(selected.coords, 13);
  }, [selectedId, objects, ready]);

  return (
    <div className={`relative rounded-card overflow-hidden shadow-card border border-line-soft ${className ?? ''}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center bg-[#E8EDF3]">
          <div className="flex flex-col items-center gap-2 text-ink-subtle">
            <Loader2 size={24} className="animate-spin text-brand" />
            <span className="text-[12px] font-medium">Загрузка карты Яндекс…</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-surface-low p-4 text-center">
          <div className="flex flex-col items-center gap-2 text-ink-subtle">
            <div className="w-10 h-10 rounded-xl bg-surface-high grid place-items-center">
              <MapPin size={20} className="text-ink-faint" />
            </div>
            <span className="text-[12px] font-medium">Карга временно недоступна</span>
            <span className="text-[10px] text-ink-faint">{error}</span>
          </div>
        </div>
      )}
      {/* overlay chrome */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-ink text-[11px] font-semibold pointer-events-none">
        <MapPin size={12} className="text-brand" />
        Алматы · BI Group
      </div>
      <div className="absolute bottom-3 left-3 z-10 px-2 py-1 rounded-md glass text-[10px] text-ink-muted font-mono pointer-events-none">
        Яндекс Карты · BI Group
      </div>
    </div>
  );
}
