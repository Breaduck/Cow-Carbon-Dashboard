/// <reference types="vite/client" />

declare namespace kakao {
  namespace maps {
    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      setLevel(level: number): void;
      getLevel(): number;
      getCenter(): LatLng;
      setBounds(bounds: LatLngBounds): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class LatLngBounds {
      constructor();
      extend(latlng: LatLng): void;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng;
      setPosition(position: LatLng): void;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
      setPosition(position: LatLng): void;
      setContent(content: string | HTMLElement): void;
    }

    class InfoWindow {
      constructor(options?: InfoWindowOptions);
      open(map: Map, marker: Marker): void;
      close(): void;
      setContent(content: string | HTMLElement): void;
    }

    class MarkerClusterer {
      constructor(options: MarkerClustererOptions);
      addMarkers(markers: Marker[]): void;
      removeMarkers(markers: Marker[]): void;
      clear(): void;
      redraw(): void;
    }

    interface MapOptions {
      center: LatLng;
      level: number;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      image?: MarkerImage;
    }

    interface CustomOverlayOptions {
      position: LatLng;
      content: string | HTMLElement;
      map?: Map;
      xAnchor?: number;
      yAnchor?: number;
    }

    interface InfoWindowOptions {
      content?: string | HTMLElement;
      removable?: boolean;
    }

    interface MarkerClustererOptions {
      map: Map;
      averageCenter?: boolean;
      minLevel?: number;
      disableClickZoom?: boolean;
      styles?: ClusterStyle[];
    }

    interface ClusterStyle {
      width: string;
      height: string;
      background: string;
      borderRadius: string;
      color: string;
      textAlign: string;
      fontWeight: string;
      lineHeight: string;
    }

    class MarkerImage {
      constructor(src: string, size: Size, options?: MarkerImageOptions);
    }

    class Size {
      constructor(width: number, height: number);
    }

    interface MarkerImageOptions {
      offset?: Point;
    }

    class Point {
      constructor(x: number, y: number);
    }

    namespace event {
      function addListener(target: object, type: string, handler: Function): void;
      function removeListener(target: object, type: string, handler: Function): void;
    }
  }
}
