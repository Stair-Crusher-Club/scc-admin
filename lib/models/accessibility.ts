export interface AccessibilitySummary {
  placeAccessibility: PlaceAccessibility
  buildingAccessibility?: BuildingAccessibility
}

export interface PlaceAccessibility {
  id: string
  placeName: string
  imageUrls: string[]
  images: AccessibilityImage[]
  floors?: number[]
  isFirstFloor: boolean
  isStairOnlyOption?: boolean
  stairInfo: STAIR_INFO
  stairHeightLevel?: STAIR_HEIGHT_LEVEL
  hasSlope: boolean
  entranceDoorTypes?: ENTRANCE_DOOR_TYPE[]
  registeredUserName?: string
  createdAtMillis: number
}

export interface BuildingAccessibility {
  id: string
  entranceStairInfo: STAIR_INFO
  entranceStairHeightLevel?: STAIR_HEIGHT_LEVEL
  entranceDoorTypes?: ENTRANCE_DOOR_TYPE[]
  entranceImageUrls: string[]
  entranceImages: AccessibilityImage[]
  hasSlope: boolean
  hasElevator: boolean
  elevatorStairInfo: STAIR_INFO
  elevatorStairHeightLevel?: STAIR_HEIGHT_LEVEL
  elevatorImageUrls: string[]
  elevatorImages: AccessibilityImage[]
  buildingName: string
  registeredUserName?: string
  createdAtMillis: number
}

export interface AccessibilityImage {
  imageUrl: string
  thumbnailUrl?: string
}

export const FLOORS = {
  FIRST: "FIRST",
  NOT_FIRST: "NOT_FIRST",
  MULTIPLE_INCLUDING_FIRST: "MULTIPLE_INCLUDING_FIRST",
} as const

type FLOORS = (typeof FLOORS)[keyof typeof FLOORS]

export const STAIR_INFO = {
  UNDEFINED: "UNDEFINED",
  NONE: "NONE",
  ONE: "ONE",
  TWO_TO_FIVE: "TWO_TO_FIVE",
  OVER_SIX: "OVER_SIX",
} as const

export type STAIR_INFO = (typeof STAIR_INFO)[keyof typeof STAIR_INFO]

export const STAIR_HEIGHT_LEVEL = {
  HALF_THUMB: "HALF_THUMB",
  THUMB: "THUMB",
  OVER_THUMB: "OVER_THUMB",
} as const

export type STAIR_HEIGHT_LEVEL = (typeof STAIR_HEIGHT_LEVEL)[keyof typeof STAIR_HEIGHT_LEVEL]

export const ENTRANCE_DOOR_TYPE = {
  NONE: "None",
  HINGED: "Hinged",
  SLIDING: "Sliding",
  REVOLVING: "Revolving",
  AUTOMATIC: "Automatic",
  ETC: "ETC",
} as const

export type ENTRANCE_DOOR_TYPE = (typeof ENTRANCE_DOOR_TYPE)[keyof typeof ENTRANCE_DOOR_TYPE]
