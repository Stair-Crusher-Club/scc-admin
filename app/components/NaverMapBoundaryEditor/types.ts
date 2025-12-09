// Naver Maps type declarations
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any
        LatLng: new (lat: number, lng: number) => any
        Marker: new (options: any) => any
        InfoWindow: new (options: any) => any
        Polyline: new (options: any) => any
        Polygon: new (options: any) => any
        Point: new (x: number, y: number) => any
        Event: {
          addListener: (target: any, type: string, listener: Function) => any
          removeListener: (listener: any) => void
        }
      }
    }
  }
}

// Component-specific types
export interface BoundaryPoint {
  lat: number
  lng: number
}

export interface BoundaryData {
  points: BoundaryPoint[]
  wkt: string
  center: BoundaryPoint
}

export interface NaverMapBoundaryEditorProps {
  initialCenter?: BoundaryPoint
  initialBoundary?: string // WKT format
  onBoundaryChange: (boundary: BoundaryData | null) => void
  height?: string
  disabled?: boolean
}
