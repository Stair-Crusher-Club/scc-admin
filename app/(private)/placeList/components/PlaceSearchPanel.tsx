"use client"

import { useState, useEffect, useContext, useRef, useCallback } from "react"
import { Search, Plus, Loader2, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AdminSearchedPlaceDto,
  AdminCircleSearchRegionDto,
  AdminRectangleSearchRegionDto,
} from "@/lib/generated-sources/openapi"
import { usePlaceSearch } from "@/lib/apis/placeList"
import Map from "@/components/Map"
import { MapContext } from "@/components/Map/Map"

function getScoreColor(score: number | null | undefined): string {
  if (score == null) return "#B5B5C0"
  if (score >= 4) return "#D32A27"
  if (score >= 2) return "#F5AB1C"
  if (score >= 1) return "#58C478"
  return "#1B8466"
}

function getScoreLabel(score: number | null | undefined): string {
  if (score == null) return "-"
  return score.toFixed(1)
}

function AccessibilityBadge({ place }: { place: AdminSearchedPlaceDto }) {
  const score = place.accessibilityScore
  const scoreColor = getScoreColor(score)
  const hasAny = place.hasPlaceAccessibility || place.hasBuildingAccessibility

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold text-white"
        style={{ backgroundColor: scoreColor }}
      >
        {getScoreLabel(score)}
      </span>
      {place.hasPlaceAccessibility && (
        <span className="text-[10px] px-1 py-0.5 rounded bg-green-100 text-green-700">
          장소
        </span>
      )}
      {place.hasBuildingAccessibility && (
        <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-700">
          건물
        </span>
      )}
      {!hasAny && place.isAccessibilityRegistrable && (
        <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-500">
          미등록
        </span>
      )}
    </div>
  )
}

// 검색 결과 마커를 지도에 표시하는 컴포넌트
function SearchResultMarkers({
  results,
  existingPlaceIds,
  onAddPlace,
  fitBounds,
}: {
  results: AdminSearchedPlaceDto[]
  existingPlaceIds: Set<string>
  onAddPlace: (place: AdminSearchedPlaceDto) => void
  fitBounds?: boolean
}) {
  const { map } = useContext(MapContext)
  const markersRef = useRef<kakao.maps.Marker[]>([])
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([])

  useEffect(() => {
    if (!map) return

    markersRef.current.forEach((m) => m.setMap(null))
    overlaysRef.current.forEach((o) => o.setMap(null))
    markersRef.current = []
    overlaysRef.current = []

    if (results.length === 0) return

    const bounds = new kakao.maps.LatLngBounds()

    results.forEach((place) => {
      const latlng = new kakao.maps.LatLng(place.location.lat, place.location.lng)
      bounds.extend(latlng)

      const isAdded = existingPlaceIds.has(place.placeId)
      const scoreColor = getScoreColor(place.accessibilityScore)
      const scoreLabel = getScoreLabel(place.accessibilityScore)
      const hasAny = place.hasPlaceAccessibility || place.hasBuildingAccessibility

      const marker = new kakao.maps.Marker({
        map,
        position: latlng,
        title: place.name,
      })
      markersRef.current.push(marker)

      const content = document.createElement("div")
      content.style.cssText = `
        padding: 8px 12px; background: white; border: 1px solid #ccc;
        border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        font-size: 13px; min-width: 200px;
      `
      const nameDiv = document.createElement("div")
      nameDiv.style.cssText = "font-weight: 600; margin-bottom: 4px;"
      nameDiv.textContent = place.name
      content.appendChild(nameDiv)

      if (place.address) {
        const addrDiv = document.createElement("div")
        addrDiv.style.cssText = "color: #666; font-size: 12px; margin-bottom: 6px;"
        addrDiv.textContent = place.address
        content.appendChild(addrDiv)
      }

      const accessDiv = document.createElement("div")
      accessDiv.style.cssText = "display: flex; align-items: center; gap: 4px; margin-bottom: 6px; flex-wrap: wrap;"

      const scoreBadge = document.createElement("span")
      scoreBadge.style.cssText = `
        display: inline-flex; align-items: center; padding: 1px 6px;
        border-radius: 4px; font-size: 11px; font-weight: 600;
        color: white; background: ${scoreColor};
      `
      scoreBadge.textContent = scoreLabel
      accessDiv.appendChild(scoreBadge)

      if (place.hasPlaceAccessibility) {
        const tag = document.createElement("span")
        tag.style.cssText = "font-size: 10px; padding: 1px 4px; border-radius: 3px; background: #dcfce7; color: #15803d;"
        tag.textContent = "장소"
        accessDiv.appendChild(tag)
      }
      if (place.hasBuildingAccessibility) {
        const tag = document.createElement("span")
        tag.style.cssText = "font-size: 10px; padding: 1px 4px; border-radius: 3px; background: #dbeafe; color: #1d4ed8;"
        tag.textContent = "건물"
        accessDiv.appendChild(tag)
      }
      if (!hasAny && place.isAccessibilityRegistrable) {
        const tag = document.createElement("span")
        tag.style.cssText = "font-size: 10px; padding: 1px 4px; border-radius: 3px; background: #f3f4f6; color: #6b7280;"
        tag.textContent = "미등록"
        accessDiv.appendChild(tag)
      }

      content.appendChild(accessDiv)

      const btn = document.createElement("button")
      btn.style.cssText = `
        padding: 4px 10px; font-size: 12px;
        border: 1px solid ${isAdded ? "#ccc" : "#2563eb"};
        border-radius: 4px;
        background: ${isAdded ? "#f3f4f6" : "#2563eb"};
        color: ${isAdded ? "#999" : "white"};
        cursor: ${isAdded ? "default" : "pointer"};
      `
      btn.textContent = isAdded ? "추가됨" : "+ 추가"
      if (!isAdded) {
        btn.onclick = () => onAddPlace(place)
      }
      content.appendChild(btn)

      const overlay = new kakao.maps.CustomOverlay({
        content,
        position: latlng,
        yAnchor: 1.3,
        zIndex: 100,
      })
      overlaysRef.current.push(overlay)

      kakao.maps.event.addListener(marker, "click", () => {
        overlaysRef.current.forEach((o) => o.setMap(null))
        overlay.setMap(map)
      })
    })

    if (fitBounds !== false) {
      map.setBounds(bounds)
    }

    return () => {
      markersRef.current.forEach((m) => m.setMap(null))
      overlaysRef.current.forEach((o) => o.setMap(null))
    }
  }, [map, results, existingPlaceIds, onAddPlace, fitBounds])

  return null
}

// 추가된 장소를 접근성 점수 색상 핀으로 표시
function AddedPlaceMarkers({
  places,
}: {
  places: Array<{ placeId: string; name: string; lat: number; lng: number; score: number | null }>
}) {
  const { map } = useContext(MapContext)
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([])

  useEffect(() => {
    if (!map) return

    overlaysRef.current.forEach((o) => o.setMap(null))
    overlaysRef.current = []

    places.forEach((place) => {
      const color = getScoreColor(place.score)

      const wrapper = document.createElement("div")
      wrapper.style.cssText = "display: flex; flex-direction: column; align-items: center;"

      const label = document.createElement("div")
      label.style.cssText = `
        padding: 2px 6px; background: ${color}; color: white; border-radius: 4px;
        font-size: 11px; font-weight: 600; white-space: nowrap; margin-bottom: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      `
      label.textContent = place.name
      wrapper.appendChild(label)

      const pin = document.createElement("div")
      pin.style.cssText = `
        width: 14px; height: 14px; background: ${color}; border: 2px solid white;
        border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      `
      wrapper.appendChild(pin)

      const overlay = new kakao.maps.CustomOverlay({
        content: wrapper,
        position: new kakao.maps.LatLng(place.lat, place.lng),
        yAnchor: 1,
        xAnchor: 0.5,
        zIndex: 200,
      })
      overlay.setMap(map)
      overlaysRef.current.push(overlay)
    })

    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null))
    }
  }, [map, places])

  return null
}

// Map 내부에서 map 인스턴스를 상위로 전달
function MapRefCapture({ onMap }: { onMap: (map: kakao.maps.Map) => void }) {
  const { map } = useContext(MapContext)
  useEffect(() => {
    if (map) onMap(map)
  }, [map, onMap])
  return null
}

interface PlaceSearchPanelProps {
  existingPlaceIds: string[]
  onAddPlace: (place: AdminSearchedPlaceDto) => void
  /** 기존 장소들의 위치 (edit 페이지에서 서버 로드 데이터 전달용) */
  initialPlaceLocations?: Array<{ placeId: string; name: string; lat: number; lng: number; score: number | null }>
}

const DEFAULT_CIRCLE_REGION: AdminCircleSearchRegionDto = {
  centerLocation: { lat: 37.566826, lng: 126.9786567 },
  radiusMeters: 50000,
}

export function PlaceSearchPanel({ existingPlaceIds, onAddPlace, initialPlaceLocations }: PlaceSearchPanelProps) {
  const [keyword, setKeyword] = useState("")
  // 실제 검색에 사용되는 값 (Enter 또는 "이 지역 재검색"으로만 변경)
  const [submittedKeyword, setSubmittedKeyword] = useState("")
  const [submittedRegion, setSubmittedRegion] = useState<
    AdminCircleSearchRegionDto | AdminRectangleSearchRegionDto
  >(DEFAULT_CIRCLE_REGION)
  const [localSearch, setLocalSearch] = useState(false)
  const [showResearch, setShowResearch] = useState(false)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [addedPlaceLocations, setAddedPlaceLocations] = useState<
    Record<string, { name: string; lat: number; lng: number; score: number | null }>
  >({})

  // API 로드 후 initialPlaceLocations가 들어오면 동기화
  useEffect(() => {
    if (!initialPlaceLocations || initialPlaceLocations.length === 0) return
    setAddedPlaceLocations((prev) => {
      const next = { ...prev }
      for (const p of initialPlaceLocations) {
        if (!next[p.placeId]) {
          next[p.placeId] = { name: p.name, lat: p.lat, lng: p.lng, score: p.score }
        }
      }
      return next
    })
  }, [initialPlaceLocations])

  const getMapBoundsRegion = (): AdminRectangleSearchRegionDto | null => {
    if (!mapRef.current) return null
    const bounds = mapRef.current.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    // 지도 뷰포트보다 10% 안쪽으로 축소해서 검색 → 결과가 화면 안에 들어옴
    const latPad = (ne.getLat() - sw.getLat()) * 0.1
    const lngPad = (ne.getLng() - sw.getLng()) * 0.1
    return {
      leftTopLocation: { lat: ne.getLat() - latPad, lng: sw.getLng() + lngPad },
      rightBottomLocation: { lat: sw.getLat() + latPad, lng: ne.getLng() - lngPad },
    }
  }

  const { data: results, isFetching } = usePlaceSearch({
    keyword: submittedKeyword,
    region: submittedRegion,
  })

  const existingIds = new Set(existingPlaceIds)

  // 추가된 장소 중 현재 리스트에 남아있는 것만 지도에 표시
  const addedPlacePins = Object.entries(addedPlaceLocations)
    .filter(([id]) => existingIds.has(id))
    .map(([placeId, loc]) => ({ placeId, ...loc }))

  const handleAddPlaceWithTracking = useCallback((place: AdminSearchedPlaceDto) => {
    setAddedPlaceLocations((prev) => ({
      ...prev,
      [place.placeId]: {
        name: place.name,
        lat: place.location.lat,
        lng: place.location.lng,
        score: place.accessibilityScore ?? null,
      },
    }))
    onAddPlace(place)
  }, [onAddPlace])

  // 지도 drag/zoom 시 "이 지역 재검색" 버튼 표시
  const handleMapReady = useCallback((map: kakao.maps.Map) => {
    mapRef.current = map
    const show = () => setShowResearch(true)
    kakao.maps.event.addListener(map, "dragend", show)
    kakao.maps.event.addListener(map, "zoom_changed", show)
  }, [])

  // Enter 키: localSearch 여부에 따라 검색 영역 결정
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && keyword.trim().length >= 2) {
      setSubmittedKeyword(keyword)
      if (localSearch) {
        const rect = getMapBoundsRegion()
        if (rect) setSubmittedRegion(rect)
      } else {
        setSubmittedRegion(DEFAULT_CIRCLE_REGION)
      }
      setShowResearch(false)
    }
  }

  // "이 지역 재검색": 현재 지도 bounds로 검색
  const handleResearchInArea = () => {
    if (!mapRef.current || submittedKeyword.trim().length < 2) return
    const rect = getMapBoundsRegion()
    if (!rect) return
    setLocalSearch(true)
    setSubmittedRegion(rect)
    setShowResearch(false)
  }

  return (
    <div className="space-y-3">
      {/* 검색창 */}
      <div className="flex items-center gap-2 border rounded-md px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 outline-none bg-transparent"
          placeholder="장소명으로 검색 후 Enter (예: 스타벅스 강남)"
        />
        {isFetching && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* 이 지역만 검색 체크박스 */}
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={localSearch}
          onChange={(e) => setLocalSearch(e.target.checked)}
          className="rounded border-gray-300"
        />
        이 지역만 검색
      </label>

      {/* 지도 + 리스트 */}
      <div className="flex gap-4" style={{ height: 800 }}>
        {/* 지도 */}
        <div className="border rounded-md overflow-hidden relative" style={{ width: 800, height: 800 }}>
          <Map
            id="place-search-map"
            initializeOptions={{
              center: { lat: 37.566826, lng: 126.9786567 },
              level: 5,
            }}
          >
            <MapRefCapture onMap={handleMapReady} />
            {results && results.length > 0 && (
              <SearchResultMarkers
                results={results}
                existingPlaceIds={existingIds}
                onAddPlace={handleAddPlaceWithTracking}
                fitBounds={!localSearch}
              />
            )}
            {addedPlacePins.length > 0 && (
              <AddedPlaceMarkers places={addedPlacePins} />
            )}
          </Map>

          {/* "이 지역 재검색" 버튼 - Map 바깥, relative 컨테이너 안 */}
          {showResearch && submittedKeyword.trim().length >= 2 && (
            <button
              onClick={handleResearchInArea}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-full shadow-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCw className="h-3.5 w-3.5" />
              이 지역 재검색
            </button>
          )}
        </div>

        {/* 검색 결과 리스트 */}
        <div className="flex-1 border rounded-md overflow-y-auto">
          {!submittedKeyword && (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              검색어를 입력 후 Enter를 누르세요
            </div>
          )}

          {submittedKeyword && results && results.length === 0 && !isFetching && (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              검색 결과가 없습니다
            </div>
          )}

          {results && results.length > 0 && (
            <div className="divide-y">
              {results.map((place) => {
                const isAdded = existingIds.has(place.placeId)
                return (
                  <div
                    key={place.placeId}
                    className="flex items-center justify-between px-3 py-3 hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">{place.name}</div>
                      {place.address && (
                        <div className="text-xs text-muted-foreground truncate">
                          {place.address}
                        </div>
                      )}
                      <AccessibilityBadge place={place} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isAdded}
                      onClick={() => handleAddPlaceWithTracking(place)}
                      className="shrink-0 ml-2"
                    >
                      {isAdded ? "추가됨" : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
