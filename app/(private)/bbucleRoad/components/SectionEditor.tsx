"use client"

import { useState, useEffect } from "react"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"

import {
  BbucleRoadSectionTypeDTO,
  CreateBbucleRoadSectionDTO,
  UpdateBbucleRoadSectionDTO,
  UpdateMapMarkerDTO,
  MapConfigDTO,
} from "@/lib/generated-sources/openapi"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ImageUploader from "@/components/ImageUploader"
import MapEditor from "./MapEditor"

interface SectionEditorProps {
  section: CreateBbucleRoadSectionDTO | UpdateBbucleRoadSectionDTO
  firstSectionMapConfig?: MapConfigDTO
  onChange: (section: CreateBbucleRoadSectionDTO | UpdateBbucleRoadSectionDTO) => void
  onRemove: () => void
  index: number
}

const SECTION_TYPE_LABELS: Record<BbucleRoadSectionTypeDTO, string> = {
  MAP_OVERVIEW: "지도로 한 눈에 보기",
  TRAFFIC: "교통정보 한 눈에 보기",
  TICKETING: "휠체어석 매표 & 경기장 입장",
  WHEELCHAIR_VIEW: "휠체어 관람 사진",
  NEARBY_RESTAURANTS: "주변 음식점",
  NEARBY_CAFES: "주변 카페",
}

export default function SectionEditor({ section, firstSectionMapConfig, onChange, onRemove, index }: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [useMap, setUseMap] = useState(
    !!(section.mapConfig?.center && section.mapConfig?.level) || !!section.markers,
  )

  const updateField = <K extends keyof typeof section>(field: K, value: (typeof section)[K]) => {
    onChange({
      ...section,
      [field]: value,
    })
  }

  const handleMapToggle = (checked: boolean) => {
    setUseMap(checked)
    if (!checked) {
      onChange({
        ...section,
        mapConfig: undefined,
        markers: undefined,
      })
    } else {
      onChange({
        ...section,
        mapConfig: {
          center: {
            lat: firstSectionMapConfig?.center?.lat || 37.5665,
            lng: firstSectionMapConfig?.center?.lng || 126.978,
          },
          level: firstSectionMapConfig?.level || 5,
        },
        markers: [],
      })
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <h4 className="font-semibold">
              섹션 {index + 1}: {SECTION_TYPE_LABELS[section.type]}
            </h4>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-2">
            {/* Section Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                섹션 타입 <span className="text-red-500">*</span>
              </label>
              <select
                value={section.type}
                onChange={(e) => updateField("type", e.target.value as BbucleRoadSectionTypeDTO)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {Object.entries(SECTION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                제목 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={section.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                placeholder="섹션 제목을 입력하세요 (여러 줄 입력 가능)"
              />
            </div>

            {/* Map Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`useMap-${index}`}
                checked={useMap}
                onChange={(e) => handleMapToggle(e.target.checked)}
              />
              <label htmlFor={`useMap-${index}`} className="text-sm font-medium">
                지도 사용
              </label>
            </div>

            {/* Map Editor */}
            {useMap && (
              <div className="space-y-4">
                <MapEditor
                  mapConfig={{
                    centerLat: section.mapConfig?.center?.lat || 37.5665,
                    centerLng: section.mapConfig?.center?.lng || 126.978,
                    zoomLevel: section.mapConfig?.level || 5,
                  }}
                  markers={(section.markers as UpdateMapMarkerDTO[]) || []}
                  onMapConfigChange={(config) => {
                    updateField("mapConfig", {
                      center: {
                        lat: config.centerLat,
                        lng: config.centerLng,
                      },
                      level: config.zoomLevel,
                    })
                  }}
                  onMarkersChange={(markers) => {
                    updateField("markers", markers)
                  }}
                  sectionType={
                    section.type === "MAP_OVERVIEW" || section.type === "TRAFFIC" || section.type === "TICKETING"
                      ? section.type
                      : undefined
                  }
                />
              </div>
            )}

            {/* Images */}
            <ImageUploader
              value={section.imageUrls || []}
              onChange={(urls) => updateField("imageUrls", urls)}
              purposeType="BBUCLE_ROAD_DESCRIPTION"
              maxImages={10}
              label="이미지"
              required={false}
            />

            {/* Accessibility Tips for TICKETING */}
            {section.type === "TICKETING" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">접근성 팁</label>
                <textarea
                  value={section.accessibilityTips || ""}
                  onChange={(e) => updateField("accessibilityTips", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  placeholder="접근성 관련 팁을 입력하세요"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
