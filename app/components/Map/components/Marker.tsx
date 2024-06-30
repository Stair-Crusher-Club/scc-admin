import { useContext } from "react"

import { MapContext } from "../Map"

export default function Marker() {
  const { map } = useContext(MapContext)
  console.log(map)
  return null
}
