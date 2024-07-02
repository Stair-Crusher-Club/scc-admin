import { useContext, useEffect, useRef } from "react"

import { MapContext } from "../Map"

type PolygonStyle = Omit<kakao.maps.PolygonOptions, "map" | "path">

interface Props {
  points: { lat: number; lng: number }[]
  style?: PolygonStyle
}

export default function Polygon({ points, style }: Props) {
  const { map } = useContext(MapContext)
  const polygon = useRef<kakao.maps.Polygon>()

  useEffect(() => {
    if (!map) return
    if (points.length === 0) return

    const latlngs = points.map((point) => new kakao.maps.LatLng(point.lat, point.lng))
    const stylesOverridden = Object.assign({}, defaultStyle, style)

    polygon.current = new kakao.maps.Polygon({
      map,
      path: latlngs, // 그려질 다각형의 좌표 배열입니다
      ...stylesOverridden,
    })

    // unmount 되면 map에서 polygon을 제거.
    return () => {
      polygon.current?.setMap(null)
    }
  }, [map, points])

  return null
}

const defaultStyle: PolygonStyle = {
  strokeWeight: 5, // 선의 두께입니다
  strokeColor: "#75B8FA", // 선의 색깔입니다
  strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
  strokeStyle: "solid", // 선의 스타일 입니다
  fillColor: "#CFE7FF", // 채우기 색깔입니다
  fillOpacity: 0.3, // 채우기 불투명도 입니다
}
