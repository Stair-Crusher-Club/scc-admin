import { EpochMillisTimestamp } from "./common"

export interface ClosedPlaceCandidate {
  id: string
  placeId: string
  name: string
  address: string
  createdAt: EpochMillisTimestamp
  acceptedAt?: EpochMillisTimestamp
  ignoredAt?: EpochMillisTimestamp
}
