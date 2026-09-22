declare namespace google.maps {
  type LatLngLiteral = { lat: number; lng: number };

  class Map {
    setCenter(center: LatLngLiteral): void;
    setZoom(zoom: number): void;
    addListener(eventName: string, handler: () => void): void;
  }

  class Marker {
    setPosition(position: LatLngLiteral): void;
    setMap(map: Map | null): void;
    addListener(eventName: string, handler: () => void): void;
  }

  class Circle {
    setCenter(center: LatLngLiteral): void;
    setRadius(radius: number): void;
    setMap(map: Map | null): void;
  }

  class InfoWindow {
    constructor(options?: { content?: string });
    setContent(content: string): void;
    setPosition(position: LatLngLiteral): void;
    open(map: Map, anchor?: Marker): void;
  }

  class DirectionsService {
    route(request: unknown, callback: (response: unknown, status: string) => void): void;
  }

  class DirectionsRenderer {
    constructor(options?: { map?: Map });
    setDirections(response: unknown): void;
  }

  enum TravelMode {
    WALKING = 'WALKING',
  }
}

