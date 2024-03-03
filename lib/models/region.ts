import { LatLng } from "./common"

export interface Region {
  boundaryVertices: LatLng[]
  id: string
  name: string
}
