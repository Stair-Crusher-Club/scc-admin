"use client"

import Script from "next/script"
import { RefObject, createContext, useEffect, useRef, useState } from "react"

import * as S from "./Map.style"

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY

export const MapContext = createContext<{ map?: kakao.maps.Map; mapElement: HTMLElement | null }>({
  map: undefined,
  mapElement: null,
})

interface Props {
  id?: string
  initializeOptions: InitializeOptions
  onInit?: (map: kakao.maps.Map) => void
}
export default function Map({ id = "map", initializeOptions, children, onInit }: React.PropsWithChildren<Props>) {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const mapContainer = useRef<HTMLElement>(null)
  // map 객체가 설정되면 MapContext.Provider에서 사용할 수 있도록 상태로 관리합니다.
  const [map, setMap] = useState<kakao.maps.Map>()

  useEffect(() => {
    if (!scriptLoaded) return
    kakao.maps.load(initializeMap)
  }, [scriptLoaded])

  function initializeMap() {
    const map = new kakao.maps.Map(mapContainer.current!, makeOptions(initializeOptions))
    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.BOTTOMLEFT)
    setMap(map)
    onInit?.(map)
  }

  return (
    <MapContext.Provider value={{ map, mapElement: mapContainer.current }}>
      <Script
        id="kakao-map-script"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
        onReady={() => setScriptLoaded(true)}
        onError={(e) => alert(`지도를 불러올 수 없습니다.`)}
      />
      <S.Map id={id} ref={mapContainer as RefObject<HTMLDivElement>} />
      {!scriptLoaded && <S.Loading>지도를 불러오는 중입니다...</S.Loading>}
      {children}
    </MapContext.Provider>
  )
}

/**
 * kakao.maps 스크립트 로딩 전 상태에서도 초기화 옵션을 전달할 수 있도록 타입 변경
 */
interface InitializeOptions extends Omit<kakao.maps.MapOptions, "center"> {
  center: { lat: number; lng: number }
}

function makeOptions(options: InitializeOptions): kakao.maps.MapOptions {
  return {
    ...options,
    center: new kakao.maps.LatLng(options.center.lat, options.center.lng),
  }
}
