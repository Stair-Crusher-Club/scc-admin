import { LatLng } from "./common"

export interface QuestSummary {
  id: string
  name: string
  shortenedUrl?: string
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
  isClosedExpected: boolean
  isConquered: boolean
  isNotAccessible: boolean
  location: LatLng
  name: string
  placeId: string
}
