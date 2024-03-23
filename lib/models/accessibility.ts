export interface AccessibilitySummary {
    placeAccessibility: PlaceAccessibility
    buildingAccessibility?: BuildingAccessibility
}

export interface PlaceAccessibility {
    id: string
    placeName: string
    registeredUserName?: string
}

export interface BuildingAccessibility {
    id: string
}
