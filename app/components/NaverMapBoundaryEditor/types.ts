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
  buildingMarkerLocation?: BoundaryPoint // Building location to show as a marker
  onBoundaryChange: (boundary: BoundaryData | null) => void
  height?: string
  disabled?: boolean
}
