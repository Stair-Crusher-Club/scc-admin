"use client"

import Script from "next/script"
import { useEffect, useRef, useState } from "react"

import { useRegions } from "@/lib/apis/api"

import * as S from "./page.style"

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY

export default function Page() {
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map>()
  const shapesRef = useRef<kakao.maps.Polygon[]>([])
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // 데이터가 바뀌어도 초기화는 한 번만 합니다.
  useEffect(() => {
    if (!scriptLoaded) return
    kakao.maps.load(() => {
      initializeMap()
    })
  }, [scriptLoaded])

  function initializeMap() {
    const mapContainer = mapElement.current!

    const options: kakao.maps.MapOptions = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567), // 적당히 초기 설정
      level: 9,
    }

    mapRef.current = new kakao.maps.Map(mapContainer, options)
  }

  return (
    <S.Page>
      <S.Header>
        오픈 지역 추가<S.PageAction>저장</S.PageAction>
      </S.Header>
      <Script
        id="kakao-map-script"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
        onReady={() => setScriptLoaded(true)}
        onError={(e) => alert(`지도를 불러올 수 없습니다.`)}
      />
      <S.Map id="map" ref={mapElement} />
      <S.ListButton>다시 그리기</S.ListButton>
    </S.Page>
  )
}
