import { EpochMillisTimestamp } from "./common"

export interface ClosedPlaceCandidate {
  id: string
  placeId: string
  name: string
  address: string
  closedAt: EpochMillisTimestamp
  acceptedAt?: EpochMillisTimestamp
  ignoredAt?: EpochMillisTimestamp
}
