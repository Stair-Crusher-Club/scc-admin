export interface AccessibilitySummary {
  placeAccessibility: PlaceAccessibility
  buildingAccessibility?: BuildingAccessibility
}

export interface PlaceAccessibility {
  id: string
  placeName: string
  imageUrls: string[]
  registeredUserName?: string
  createdAtMillis: number
}

export interface BuildingAccessibility {
  id: string
  imageUrls: string[]
}
