"use client"

import { useRouter } from "next/navigation"
import clip from "polygon-clipping"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"

import { LatLng } from "@/lib/models/common"

import Map from "@/components/Map"
import { Circle, Polygon } from "@/components/Map/components"
import { Contents, Header } from "@/components/layout"

import { useCrawling } from "../query"

type InputMode = "POLYGON" | "CIRCLE_CENTER" | "CIRCLE_RADIUS" | "CIRCLE_COMPLETE"
type CrawlingStatus = "WAITING" | "CRAWLING" | "DONE"
interface Chunk {
  polygon: clip.Polygon
  status: CrawlingStatus
}

interface FormValues {
  points: LatLng[]
  circle: { center: LatLng; radius: number }
}
export default function CrawlPage() {
  const mode = useRef<InputMode>("POLYGON")
  const [status, setCrawlingStatus] = useState<CrawlingStatus>("WAITING")
  const [chunks, setChunks] = useState<Chunk[]>([])
  const timeout = useRef<number | null>(null)
  const form = useForm<FormValues>({ defaultValues: { points: [], circle: {} } })
  const crawling = useCrawling()

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  function handleKeyDown(e: KeyboardEvent) {
    if (status === "CRAWLING") return
    if ((e.metaKey || e.ctrlKey) && e.key === "z") {
      e.preventDefault()
      if (form.watch("points").length === 0) return
      form.setValue("points", [...form.watch("points").slice(0, -1)])
      makeChunks()
    }
  }

  function initializeMap(map: kakao.maps.Map) {
    kakao.maps.event.addListener(map, "mousedown", (e: kakao.maps.event.MouseEvent) => handleMouseDown(e))
    kakao.maps.event.addListener(map, "mouseup", (e: kakao.maps.event.MouseEvent) => handleMouseUp(e))
    kakao.maps.event.addListener(map, "click", (e: kakao.maps.event.MouseEvent) => handleClick(e))
    kakao.maps.event.addListener(map, "mousemove", (e: kakao.maps.event.MouseEvent) => handleMouseMove(e))
    kakao.maps.event.addListener(map, "bounds_changed", () => handleMapPan())
  }

  function handleClick(e: kakao.maps.event.MouseEvent) {
    if (timeout.current) {
      window.clearTimeout(timeout.current)
      timeout.current = null
    }
    if (status === "CRAWLING") return
    if (status === "DONE") {
      setChunks([])
    }
    if (mode.current == "POLYGON") {
      form.setValue("points", [...form.getValues("points"), { lat: e.latLng.getLat(), lng: e.latLng.getLng() }])
      makeChunks()
      return
    }
    if (mode.current == "CIRCLE_CENTER") {
      mode.current = "CIRCLE_RADIUS"
      return
    }
    if (mode.current == "CIRCLE_RADIUS") {
      const center = new kakao.maps.LatLng(form.watch("circle.center.lat"), form.watch("circle.center.lng"))
      const mousePos = new kakao.maps.LatLng(e.latLng.getLat(), e.latLng.getLng())
      const length = new kakao.maps.Polyline({ path: [center, mousePos] }).getLength()
      form.setValue("circle.radius", length)
      form.setValue("points", [])
      makeChunksFromCircle()
      mode.current = "CIRCLE_COMPLETE"
    }
  }

  function handleMouseDown(e: kakao.maps.event.MouseEvent) {
    timeout.current = window.setTimeout(() => {
      console.log("timeout run", timeout.current)
      form.setValue("circle.center.lat", e.latLng.getLat())
      form.setValue("circle.center.lng", e.latLng.getLng())
      form.setValue("circle.radius", 0)
      form.setValue("points", [])
      timeout.current = null
      mode.current = "CIRCLE_CENTER"
    }, 1000)
  }

  function handleMouseUp(e: kakao.maps.event.MouseEvent) {}

  function handleMouseMove(e: kakao.maps.event.MouseEvent) {
    if (mode.current === "CIRCLE_RADIUS") {
      const center = new kakao.maps.LatLng(form.watch("circle.center.lat"), form.watch("circle.center.lng"))
      const mousePos = new kakao.maps.LatLng(e.latLng.getLat(), e.latLng.getLng())
      const length = new kakao.maps.Polyline({ path: [center, mousePos] }).getLength()
      form.setValue("circle.radius", length)
    }
  }

  function handleMapPan() {
    window.clearTimeout(timeout.current!)
    timeout.current = null
  }

  function makeChunks() {
    const points = form.watch("points")
    const chunks = chunkify(points)
    // chunks 중 겹친 영역이 있는 것만 남긴다
    const validChunks = chunks.filter((chunk) => {
      const polygon: clip.Polygon = [points.map((p) => [p.lng, p.lat] as clip.Pair)]
      const intersection = clip.intersection(chunk, polygon)
      return intersection.length > 0
    })

    setChunks(validChunks.map((p) => ({ polygon: p, status: "WAITING" })))
  }

  function makeChunksFromCircle() {
    const center = form.watch("circle.center")
    const radius = form.watch("circle.radius")
    const points = Array.from({ length: 90 })
      .fill(0)
      .map((_, i) => ({
        lat: center.lat + (radius / 111000) * Math.cos((4 * i) / (2 * Math.PI)),
        lng: center.lng + (radius / 88000) * Math.sin((4 * i) / (2 * Math.PI)),
      })) as LatLng[]

    const chunks = chunkify(points)
    // chunks 중 겹친 영역이 있는 것만 남긴다
    const validChunks = chunks.filter((chunk) => {
      const polygon: clip.Polygon = [points.map((p) => [p.lng, p.lat] as clip.Pair)]
      const intersection = clip.intersection(chunk, polygon)
      return intersection.length > 0
    })

    setChunks(validChunks.map((p) => ({ polygon: p, status: "WAITING" })))
  }

  async function startCrawl() {
    setCrawlingStatus("CRAWLING")
    for (const chunk of chunks) {
      const boundary = chunk.polygon[0].map((c) => ({ lng: c[0], lat: c[1] }))
      setChunks((prevChunks) =>
        prevChunks.map((prevChunk) =>
          prevChunk.polygon === chunk.polygon ? { ...prevChunk, status: "CRAWLING" } : prevChunk,
        ),
      )
      await crawling.mutateAsync(boundary)

      // update chunk status
      setChunks((prevChunks) =>
        prevChunks.map((prevChunk) =>
          prevChunk.polygon === chunk.polygon ? { ...prevChunk, status: "DONE" } : prevChunk,
        ),
      )
    }
    setCrawlingStatus("DONE")
    form.setValue("points", [])
  }

  return (
    <>
      <Header title="장소 정보 가져오기">
        <Header.ActionButton onClick={startCrawl}>이 지역 장소 정보 가져오기</Header.ActionButton>
      </Header>
      <Contents.Columns>
        <Map id="map" initializeOptions={{ center: { lat: 37.566826, lng: 126.9786567 } }} onInit={initializeMap}>
          {mode.current.startsWith("CIRCLE") && (
            <Circle center={form.watch("circle.center")} radius={form.watch("circle.radius")} showRadius />
          )}
          {mode.current === "POLYGON" && <Polygon points={form.watch("points")} forDrawing />}
          {chunks.map((c, i) => (
            <Polygon
              key={i}
              points={c.polygon[0].map((p) => ({ lat: p[1], lng: p[0] }))}
              style={{
                fillColor: c.status === "CRAWLING" ? "yellow" : "green",
                fillOpacity: c.status === "WAITING" ? 0 : 0.3,
                strokeColor: "#000",
                strokeStyle: "dashed",
                strokeOpacity: status === "WAITING" ? 0.1 : 0.4,
              }}
            />
          ))}
        </Map>
      </Contents.Columns>
    </>
  )
}

function chunkify(points: LatLng[]): clip.Polygon[] {
  // 서울 기준, 약
  // 위도 0.00001도 당 1.11m : 1도에 111km
  // 경도 0.00001도 당 0.88m : 1도에 88km
  // 인 것을 기준으로 대충 청크를 나눈다.
  const bounds = new kakao.maps.LatLngBounds()
  points.forEach((p) => {
    bounds.extend(new kakao.maps.LatLng(p.lat, p.lng))
  })
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()

  const boundHeight = (ne.getLat() - sw.getLat()) * 111000
  const boundWidth = (ne.getLng() - sw.getLng()) * 88000

  const rowCount = boundHeight < 120 * 2 ? Math.ceil(boundHeight / 120) : Math.round(boundHeight / 120)
  const colCount = boundWidth < 120 * 2 ? Math.ceil(boundWidth / 120) : Math.round(boundWidth / 120)

  const chunkHeight = boundHeight / rowCount
  const chunkWidth = boundWidth / colCount

  const chunks: clip.Polygon[] = []
  for (var i = 0; i < rowCount; i++) {
    for (var j = 0; j < colCount; j++) {
      const lat1 = sw.getLat() + (i * chunkHeight) / 111000
      const lat2 = sw.getLat() + ((i + 1) * chunkHeight) / 111000
      const lng1 = sw.getLng() + (j * chunkWidth) / 88000
      const lng2 = sw.getLng() + ((j + 1) * chunkWidth) / 88000

      const polygon: clip.Polygon = [
        [
          [lng1, lat1],
          [lng2, lat1],
          [lng2, lat2],
          [lng1, lat2],
          [lng1, lat1],
        ],
      ]

      chunks.push(polygon)
    }
  }

  return chunks
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
