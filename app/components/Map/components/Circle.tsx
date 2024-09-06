import { useContext, useEffect, useRef } from "react"

import { LatLng } from "@/lib/models/common"

import { MapContext } from "../Map"

type CircleStyle = Omit<kakao.maps.CircleOptions, "map" | "center" | "radius">

interface Props {
  center: LatLng | undefined
  radius: number
  circleStyle?: CircleStyle
  showRadius?: boolean
}

export default function Circle({ center, radius, circleStyle, showRadius }: Props) {
  const { map } = useContext(MapContext)
  const circle = useRef<kakao.maps.Circle>()
  const centerMarker = useRef<kakao.maps.Marker>()
  const radiusOverlay = useRef<kakao.maps.CustomOverlay>()

  useEffect(() => {
    if (!map) return
    if (!center) return

    const latlng = new kakao.maps.LatLng(center.lat, center.lng)
    const stylesOverridden = Object.assign({}, defaultStyle, circleStyle)

    circle.current = new kakao.maps.Circle({
      map,
      center: latlng, // 원의 중심좌표 입니다
      radius, // 미터 단위의 원의 반지름입니다
      ...stylesOverridden,
    })

    centerMarker.current = new kakao.maps.Marker({
      map,
      position: latlng,
      image: new kakao.maps.MarkerImage("/marker_center.jpg", new kakao.maps.Size(20, 20), {
        offset: new kakao.maps.Point(10, 10),
      }),
    })

    if (showRadius && radius) {
      radiusOverlay.current = new kakao.maps.CustomOverlay({
        map,
        position: latlng,
        zIndex: 1,
        content: '<div class="radius">반경 ' + radius.toFixed(1) + "m</div>",
      })
    }

    // unmount 되면 map에서 circle을 제거.
    return () => {
      circle.current?.setMap(null)
      centerMarker.current?.setMap(null)
      radiusOverlay.current?.setMap(null)
    }
  }, [map, center?.lat, center?.lng, radius, circleStyle, showRadius])

  return null
}

const defaultStyle: CircleStyle = {
  strokeWeight: 5, // 선의 두께입니다
  strokeColor: "#75B8FA", // 선의 색깔입니다
  strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
  strokeStyle: "solid", // 선의 스타일 입니다
  fillColor: "#CFE7FF", // 채우기 색깔입니다
  fillOpacity: 0.1, // 채우기 불투명도 입니다
}
