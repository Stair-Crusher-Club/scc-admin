import {EpochMillisTimestamp, LatLng} from "./common"

export type QuestPurposeType = 'CRUSHER_CLUB' | 'DAILY_CLUB' | 'COLLABO_CLUB' | 'ESG_PARTNERS'

export interface QuestSummary {
  id: string
  name: string
  purposeType: QuestPurposeType
  startAt: EpochMillisTimestamp
  endAt: EpochMillisTimestamp
  shortenedUrl?: string
}

export interface QuestDetail {
  id: string
  name: string
  purposeType: QuestPurposeType
  startAt: EpochMillisTimestamp
  endAt: EpochMillisTimestamp
  buildings: QuestBuilding[]
  shortenedUrl?: string
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
