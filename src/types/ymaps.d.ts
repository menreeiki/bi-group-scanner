// Minimal type declarations for the Yandex Maps JS API global.
// The full API is loaded dynamically at runtime from
// https://api-maps.yandex.ru/2.1/?apikey=...&lang=ru_RU

declare global {
  interface Window {
    ymaps?: typeof ymaps;
  }

  const ymaps: {
    ready: (fn?: () => void) => Promise<void>;
    Map: new (
      element: HTMLElement | string,
      options: {
        center: [number, number];
        zoom: number;
        controls?: string[];
      },
    ) => YandexMapInstance;
    Placemark: new (
      coords: [number, number],
      properties: {
        balloonContentHeader?: string;
        balloonContentBody?: string;
        hintContent?: string;
      },
      options?: {
        preset?: string;
        iconColor?: string;
        iconLayout?: typeof ymaps.templateLayoutFactory;
        iconShape?: { type: string; coordinates: number[][] };
      },
    ) => YandexGeoObject;
    templateLayoutFactory: {
      createClass: (template: string) => unknown;
    };
  };

  interface YandexMapInstance {
    geoObjects: {
      add: (obj: YandexGeoObject) => YandexMapInstance;
      remove: (obj: YandexGeoObject) => YandexMapInstance;
      getIterator: () => { getNext: () => YandexGeoObject | null };
    };
    setCenter: (coords: [number, number], zoom?: number) => void;
    setZoom: (zoom: number) => void;
    destroy: () => void;
    events: {
      add: (type: string, fn: () => void) => void;
    };
  }

  interface YandexGeoObject {
    events: {
      add: (type: string, fn: (e: { get: (key: string) => unknown }) => void) => void;
    };
  }
}

export {};
