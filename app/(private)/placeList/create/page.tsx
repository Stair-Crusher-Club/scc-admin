"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

import { AdminPlaceListAccessControlDto, AdminSearchedPlaceDto } from "@/lib/generated-sources/openapi"
import { useCreatePlaceList } from "@/lib/apis/placeList"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ACCESS_CONTROL_LABELS, ACCESS_CONTROL_OPTIONS } from "../components/accessControl"
import { PlaceSearchPanel } from "../components/PlaceSearchPanel"
import { SortablePlaceList } from "../components/SortablePlaceList"

export default function PlaceListCreatePage() {
  const router = useRouter()
  const { mutateAsync: createPlaceList, isPending: isCreating } = useCreatePlaceList()

  const [name, setName] = useState("")
  const [shortName, setShortName] = useState("")
  const [description, setDescription] = useState("")
  const [iconColor, setIconColor] = useState("#FFC01E")
  const [accessControl, setAccessControl] = useState<AdminPlaceListAccessControlDto>(
    AdminPlaceListAccessControlDto.Public,
  )
  const [places, setPlaces] = useState<AdminSearchedPlaceDto[]>([])

  const handleCreate = async () => {
    try {
      await createPlaceList({
        name,
        shortName: shortName || null,
        description: description || null,
        iconColor: iconColor || null,
        accessControl,
        placeIds: places.map((p) => p.placeId),
      })
      toast.success("리스트가 생성되었습니다.")
      router.push("/placeList")
    } catch {
      toast.error("리스트 생성에 실패했습니다.")
    }
  }

  const handleAddPlace = (place: AdminSearchedPlaceDto) => {
    if (places.some((p) => p.placeId === place.placeId)) {
      return
    }
    setPlaces([...places, place])
  }

  const handleRemovePlace = (placeId: string) => {
    setPlaces(places.filter((p) => p.placeId !== placeId))
  }

  return (
    <Contents.Normal>
      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">기본 정보</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="리스트 이름"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                짧은 이름 <span className="text-muted-foreground text-xs">(최대 8자, 검색 태그에 표시)</span>
              </label>
              <input
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="예: 홍대핫플"
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="리스트 설명"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">아이콘 색상</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <input
                  value={iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  className="w-32 px-3 py-2 border rounded-md font-mono text-sm"
                  placeholder="#FFC01E"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">공개 설정</label>
              <Select
                value={accessControl}
                onValueChange={(value) => setAccessControl(value as AdminPlaceListAccessControlDto)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_CONTROL_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {ACCESS_CONTROL_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </CardContent>
        </Card>

        {/* Places */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">장소 검색 & 추가</h3>

            <PlaceSearchPanel
              existingPlaceIds={places.map((p) => p.placeId)}
              onAddPlace={handleAddPlace}
            />

            <h4 className="text-sm font-medium text-muted-foreground">
              추가된 장소 ({places.length}개)
            </h4>

            {places.length === 0 ? (
              <p className="text-sm text-muted-foreground">장소를 검색하여 추가하세요.</p>
            ) : (
              <SortablePlaceList
                items={places}
                onReorder={setPlaces}
                onRemove={handleRemovePlace}
              />
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/placeList")}
            disabled={isCreating}
          >
            취소
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
            {isCreating ? "생성 중..." : "생성"}
          </Button>
        </div>
      </div>
    </Contents.Normal>
  )
}
