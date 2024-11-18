import { useContext, useEffect, useRef } from "react"

import { MapContext } from "../Map"

interface Props {
  updateInterval?: number
}
export default function Me({ updateInterval = 1000 }: Props) {
  const { map } = useContext(MapContext)
  const me = useRef<kakao.maps.Marker>()

  useEffect(() => {
    const interval = setInterval(updateMyLocationMarker, updateInterval)
    return () => {
      clearInterval(interval)
      me.current?.setMap(null)
    }
  }, [map])

  async function getMyLocation() {
    if (!navigator.geolocation) return null

    return new Promise<{ lat: number; lng: number }>((resolve) =>
      navigator.geolocation.getCurrentPosition(function (position) {
        const lat = position.coords.latitude // 위도
        const lng = position.coords.longitude // 경도
        resolve({ lat, lng })
      }),
    )
  }

  async function updateMyLocationMarker() {
    if (!map) return

    const myLocation = await getMyLocation()
    if (!myLocation) return

    // 기존 마커는 지우고
    if (me.current) {
      me.current.setMap(null)
    }

    // 새 위치에 마커 그리기
    const latlng = new kakao.maps.LatLng(myLocation.lat, myLocation.lng)
    me.current = new kakao.maps.Marker({
      map,
      position: latlng,
      image: new kakao.maps.MarkerImage("/me.png", new kakao.maps.Size(16, 16), {
        offset: new kakao.maps.Point(8, 8),
      }),
    })
  }

  return null
}
