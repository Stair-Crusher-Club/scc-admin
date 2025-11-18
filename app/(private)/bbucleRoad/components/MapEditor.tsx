"use client"

import { useEffect, useRef, useState } from "react"

import { UpdateMapMarkerDTO, MarkerCategoryDTO } from "@/lib/generated-sources/openapi"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Naver Maps type declarations
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any
        LatLng: new (lat: number, lng: number) => any
        Marker: new (options: any) => any
        InfoWindow: new (options: any) => any
        Point: new (x: number, y: number) => any
        Event: {
          addListener: (target: any, type: string, listener: Function) => void
        }
      }
    }
  }
}

interface MapConfig {
  centerLat: number
  centerLng: number
  zoomLevel: number
}

interface Props {
  mapConfig: MapConfig
  markers: UpdateMapMarkerDTO[]
  onMapConfigChange: (config: MapConfig) => void
  onMarkersChange: (markers: UpdateMapMarkerDTO[]) => void
  sectionType?: "MAP_OVERVIEW" | "TRAFFIC" | "TICKETING"
}

export default function MapEditor({
  mapConfig,
  markers,
  onMapConfigChange,
  onMarkersChange,
  sectionType,
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>()
  const markersRef = useRef<any[]>([])
  const infoWindowsRef = useRef<any[]>([])
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null)
  const [isAddingMarker, setIsAddingMarker] = useState(false)
  const isAddingMarkerRef = useRef(false)
  const selectedMarkerIndexRef = useRef<number | null>(null)
  const markersStateRef = useRef<UpdateMapMarkerDTO[]>([])

  // Sync refs with state
  useEffect(() => {
    isAddingMarkerRef.current = isAddingMarker
  }, [isAddingMarker])

  useEffect(() => {
    selectedMarkerIndexRef.current = selectedMarkerIndex
  }, [selectedMarkerIndex])

  useEffect(() => {
    markersStateRef.current = markers
  }, [markers])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !window.naver || !window.naver.maps) return

    // Prevent duplicate map creation
    if (mapRef.current) return

    const container = mapContainer.current
    const center = new window.naver.maps.LatLng(mapConfig.centerLat, mapConfig.centerLng)
    const options = {
      center,
      zoom: mapConfig.zoomLevel,
    }

    const map = new window.naver.maps.Map(container, options)
    mapRef.current = map

    // Listen to map changes to update config
    window.naver.maps.Event.addListener(map, "center_changed", () => {
      const center = map.getCenter()
      const zoom = map.getZoom()
      onMapConfigChange({
        centerLat: center.lat(),
        centerLng: center.lng(),
        zoomLevel: zoom,
      })
    })

    window.naver.maps.Event.addListener(map, "zoom_changed", () => {
      const center = map.getCenter()
      const zoom = map.getZoom()
      onMapConfigChange({
        centerLat: center.lat(),
        centerLng: center.lng(),
        zoomLevel: zoom,
      })
    })

    // Add click listener for adding/moving markers
    window.naver.maps.Event.addListener(map, "click", (e: any) => {
      const latlng = e.coord
      const position = {
        lat: latlng.lat(),
        lng: latlng.lng(),
      }

      // Check if we're in add mode or edit mode
      if (isAddingMarkerRef.current) {
        // Add mode: create new marker
        let defaultCategory: MarkerCategoryDTO = "RESTAURANT"
        if (sectionType === "TRAFFIC") {
          defaultCategory = "SUBWAY_EXIT"
        } else if (sectionType === "TICKETING") {
          defaultCategory = "TICKET_BOOTH"
        }

        addMarker({
          id: `marker-${Date.now()}`,
          category: defaultCategory,
          position,
          tooltipText: "",
          size: { width: 32, height: 32 },
          customImageUrl: undefined,
        })
      } else if (selectedMarkerIndexRef.current !== null) {
        // Edit mode: move selected marker
        updateMarker(selectedMarkerIndexRef.current, { position })
      }
    })

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers on map when markers prop changes
  useEffect(() => {
    if (!mapRef.current || !window.naver || !window.naver.maps) return

    // Clear existing markers and info windows
    markersRef.current.forEach((marker) => marker.setMap(null))
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close())
    markersRef.current = []
    infoWindowsRef.current = []

    // Add new markers
    markers.forEach((markerData, index) => {
      const position = new window.naver.maps.LatLng(markerData.position.lat, markerData.position.lng)

      // 선택된 마커는 빨간색, 일반 마커는 파란색
      const isSelected = index === selectedMarkerIndex
      const markerColor = isSelected ? '#ef4444' : '#3b82f6'

      const marker = new window.naver.maps.Marker({
        position,
        map: mapRef.current,
        icon: {
          content: `<div style="
            width: 24px;
            height: 24px;
            background-color: ${markerColor};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          anchor: new window.naver.maps.Point(12, 12),
        },
      })

      // Create info window for tooltip
      if (markerData.tooltipText) {
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `<div style="padding: 8px; min-width: 100px;">${markerData.tooltipText}</div>`,
        })

        // Show tooltip on hover
        window.naver.maps.Event.addListener(marker, "mouseover", () => {
          infoWindow.open(mapRef.current, marker)
        })

        window.naver.maps.Event.addListener(marker, "mouseout", () => {
          infoWindow.close()
        })

        infoWindowsRef.current.push(infoWindow)
      }

      // Add click listener to select marker
      window.naver.maps.Event.addListener(marker, "click", () => {
        setSelectedMarkerIndex(index)
        setIsAddingMarker(false)
      })

      markersRef.current.push(marker)
    })
  }, [markers, selectedMarkerIndex])

  const addMarker = (marker: UpdateMapMarkerDTO) => {
    onMarkersChange([...markersStateRef.current, marker])
  }

  const updateMarker = (index: number, updates: Partial<UpdateMapMarkerDTO>) => {
    const newMarkers = [...markersStateRef.current]
    newMarkers[index] = { ...newMarkers[index], ...updates }
    onMarkersChange(newMarkers)
  }

  const deleteMarker = (index: number) => {
    const newMarkers = markersStateRef.current.filter((_, i) => i !== index)
    onMarkersChange(newMarkers)
    setSelectedMarkerIndex(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Map Container */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-4">
            <div ref={mapContainer} className="w-full rounded-md" style={{ height: '500px' }} />
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">마커 추가</h3>
            <Button
              type="button"
              onClick={() => {
                setIsAddingMarker(!isAddingMarker)
                if (!isAddingMarker) {
                  setSelectedMarkerIndex(null)
                }
              }}
              variant={isAddingMarker ? "default" : "outline"}
              className="w-full"
            >
              {isAddingMarker ? "지도를 클릭하여 마커 추가 (활성)" : "마커 추가 모드"}
            </Button>
            {!isAddingMarker && selectedMarkerIndex !== null && (
              <p className="text-sm text-muted-foreground">
                💡 지도를 클릭하면 선택된 마커가 이동합니다
              </p>
            )}
          </CardContent>
        </Card>

        {/* Marker List */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">마커 목록 ({markers.length}개)</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {markers.map((marker, index) => (
                <div
                  key={marker.id}
                  className={`p-3 border rounded-md cursor-pointer ${
                    selectedMarkerIndex === index ? "border-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedMarkerIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{marker.category}</div>
                      <div className="text-xs text-gray-500">
                        {marker.position.lat.toFixed(6)}, {marker.position.lng.toFixed(6)}
                      </div>
                      {marker.tooltipText && (
                        <div className="text-xs text-gray-600 mt-1">{marker.tooltipText}</div>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMarker(index)
                      }}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Marker Editor */}
        {selectedMarkerIndex !== null && markers[selectedMarkerIndex] && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">마커 편집</h3>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">카테고리</label>
                <select
                  value={markers[selectedMarkerIndex].category}
                  onChange={(e) =>
                    updateMarker(selectedMarkerIndex, { category: e.target.value as MarkerCategoryDTO })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="RESTAURANT">레스토랑</option>
                  <option value="CAFE">카페</option>
                  <option value="ACCESSIBLE_TOILET">접근 가능한 화장실</option>
                  <option value="ACCESSIBILITY_INFO">접근성 정보</option>
                  <option value="TICKET_BOOTH">티켓 부스</option>
                  <option value="ENTRANCE">입구</option>
                  <option value="ELEVATOR">엘리베이터</option>
                  <option value="SUBWAY_EXIT">지하철 출구</option>
                  <option value="BUS_STOP">버스 정류장</option>
                  <option value="PARKING">주차장</option>
                  <option value="CUSTOM">커스텀</option>
                </select>
              </div>

              {/* Custom Image Upload - only for CUSTOM category */}
              {markers[selectedMarkerIndex].category === "CUSTOM" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">커스텀 이미지</label>
                  <input
                    type="text"
                    value={markers[selectedMarkerIndex].customImageUrl || ""}
                    onChange={(e) => updateMarker(selectedMarkerIndex, { customImageUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="이미지 URL을 입력하세요"
                  />
                  <p className="text-xs text-muted-foreground">
                    또는 ImageUploader 컴포넌트를 사용하여 이미지를 업로드할 수 있습니다.
                  </p>
                </div>
              )}

              {/* Tooltip Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium">툴팁 텍스트</label>
                <input
                  type="text"
                  value={markers[selectedMarkerIndex].tooltipText || ""}
                  onChange={(e) => updateMarker(selectedMarkerIndex, { tooltipText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="마커 클릭 시 표시될 텍스트"
                />
              </div>

              {/* Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium">크기</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">너비</label>
                    <input
                      type="number"
                      value={markers[selectedMarkerIndex].size?.width || 32}
                      onChange={(e) =>
                        updateMarker(selectedMarkerIndex, {
                          size: {
                            width: parseInt(e.target.value),
                            height: markers[selectedMarkerIndex].size?.height || 32,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      min="16"
                      max="64"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">높이</label>
                    <input
                      type="number"
                      value={markers[selectedMarkerIndex].size?.height || 32}
                      onChange={(e) =>
                        updateMarker(selectedMarkerIndex, {
                          size: {
                            width: markers[selectedMarkerIndex].size?.width || 32,
                            height: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      min="16"
                      max="64"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
