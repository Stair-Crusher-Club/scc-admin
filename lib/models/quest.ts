export interface LatLng {
  lng: number
  lat: number
}

export interface QuestSummary {
  id: string
  name: string
}

export interface QuestDetail {
  id: string
  name: string
  buildings: QuestBuilding[]
}

export interface QuestBuilding {
  buildingId: string
  location: LatLng
  name: string
  places: QuestPlace[]
}

export interface QuestPlace {
  buildingId: string
  isClosed: boolean
  isConquered: boolean
  isNotAccessible: boolean
  location: LatLng
  name: string
  placeId: string
}
