import { useContext, useEffect, useRef } from "react"

import { MapContext } from "../Map"

type PolygonStyle = Omit<kakao.maps.PolygonOptions, "map" | "path">

interface Props {
  points: { lat: number; lng: number }[]
  label?: string
  style?: PolygonStyle
}

export default function Polygon({ points, label, style }: Props) {
  const { map } = useContext(MapContext)
  const firstPoint = useRef<kakao.maps.Circle>()
  const lastPoint = useRef<kakao.maps.Circle>()
  const polygon = useRef<kakao.maps.Polygon>()
  const labelOverlay = useRef<kakao.maps.CustomOverlay>()

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

    if (label) {
      const center = getCenterOf(points)
      labelOverlay.current = new kakao.maps.CustomOverlay({
        map: map,
        content: `<div style="padding:5px;background:rgba(255,255,255,0.5)"><b>${label}</b></div>`,
        position: center,
        zIndex: 3,
      })
    }

    // unmount 되면 map에서 polygon을 제거.
    return () => {
      polygon.current?.setMap(null)
      labelOverlay.current?.setMap(null)
    }
  }, [map, points])

  // 처음에 클릭한 점에 표시 추가
  useEffect(() => {
    if (!map) return
    if (points.length < 1) return

    const firstPin = points[0]
    if (!firstPin) return
    const latlng = new kakao.maps.LatLng(firstPin.lat, firstPin.lng)

    firstPoint.current = new kakao.maps.Circle({
      map,
      center: latlng,
      radius: 5,
      strokeColor: "#c33f3b", // 선의 색깔입니다
      strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
    })

    // unmount 되면 map에서 제거.
    return () => {
      firstPoint.current?.setMap(null)
    }
  }, [map, points[0]])

  // 마지막에 클릭한 점에 표시 추가
  useEffect(() => {
    if (!map) return
    if (points.length < 1) return

    const lastPin = points.at(-1)
    if (!lastPin) return
    const latlng = new kakao.maps.LatLng(lastPin.lat, lastPin.lng)

    lastPoint.current = new kakao.maps.Circle({
      map,
      center: latlng,
      radius: 5,
      strokeColor: "#3b7fc3", // 선의 색깔입니다
      strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
    })

    // unmount 되면 map에서 제거.
    return () => {
      lastPoint.current?.setMap(null)
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

function getCenterOf(vertices: { lat: number; lng: number }[]) {
  const bounds = new kakao.maps.LatLngBounds()
  vertices.forEach((v) => bounds.extend(new kakao.maps.LatLng(v.lat, v.lng)))
  const centerLat = (bounds.getNorthEast().getLat() + bounds.getSouthWest().getLat()) / 2
  const centerLng = (bounds.getNorthEast().getLng() + bounds.getSouthWest().getLng()) / 2
  return new kakao.maps.LatLng(centerLat, centerLng)
}
