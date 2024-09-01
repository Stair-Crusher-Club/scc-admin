"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import Map from "@/components/Map"
import { Circle, Polygon } from "@/components/Map/components"
import { Contents, Header } from "@/components/layout"

interface FormValues {
  points: { lat: number; lng: number }[]
}
export default function CrawlPage() {
  const router = useRouter()
  const form = useForm<FormValues>({ defaultValues: { points: [] } })

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  function handleKeyDown(e: KeyboardEvent) {
    if (e.metaKey && e.key === "z") {
      if (form.watch("points").length === 0) return
      form.setValue("points", [...form.watch("points").slice(0, -1)])
    }
  }

  function initializeMap(map: kakao.maps.Map) {
    kakao.maps.event.addListener(map, "click", (e: kakao.maps.event.MouseEvent) => handleClick(e.latLng))
  }

  function handleClick(latLng: kakao.maps.LatLng) {
    form.setValue("points", [...form.getValues("points"), { lat: latLng.getLat(), lng: latLng.getLng() }])
  }

  function startCrawl() {
    const polygon = new kakao.maps.Polygon({
      path: form.watch("points").map((p) => new kakao.maps.LatLng(p.lat, p.lng)),
    })

    const bounds = new kakao.maps.LatLngBounds()
    form.watch("points").forEach((p) => {
      bounds.extend(new kakao.maps.LatLng(p.lat, p.lng))
    })

    console.log(bounds)
  }

  return (
    <>
      <Header title="장소 정보 가져오기">
        <Header.ActionButton onClick={startCrawl}>이 지역 장소 정보 가져오기</Header.ActionButton>
      </Header>
      <Contents.Columns>
        <Map id="map" initializeOptions={{ center: { lat: 37.566826, lng: 126.9786567 } }} onInit={initializeMap}>
          <Polygon points={form.watch("points")} />
        </Map>
      </Contents.Columns>
    </>
  )
}
