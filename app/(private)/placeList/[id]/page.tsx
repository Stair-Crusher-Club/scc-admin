"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import {
  AdminImageUploadPurposeTypeDTO,
  AdminPlaceListAccessControlDto,
  AdminPlaceListNameChipDto,
  AdminPlaceListPlaceDto,
  AdminSearchedPlaceDto,
  AdminUserInterestedThemeDto,
} from "@/lib/generated-sources/openapi"
import {
  usePlaceListDetail,
  useUpdatePlaceList,
  useDeletePlaceList,
} from "@/lib/apis/placeList"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Contents } from "@/components/layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageUploader from "@/components/ImageUploader"
import { ACCESS_CONTROL_LABELS, ACCESS_CONTROL_OPTIONS } from "../components/accessControl"
import { THEME_LABELS, THEME_OPTIONS } from "../components/themes"
import { PlaceSearchPanel } from "../components/PlaceSearchPanel"
import { SortablePlaceList } from "../components/SortablePlaceList"

export default function PlaceListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const placeListId = params.id as string

  const { data: placeList, isLoading } = usePlaceListDetail({ id: placeListId })
  const { mutateAsync: updatePlaceList, isPending: isUpdating } = useUpdatePlaceList()
  const { mutateAsync: deletePlaceList, isPending: isDeleting } = useDeletePlaceList()

  const [name, setName] = useState("")
  const [chipText, setChipText] = useState("")
  const [chipIconUrls, setChipIconUrls] = useState<string[]>([])
  const [chipBackgroundColor, setChipBackgroundColor] = useState("")
  const [chipBorderColor, setChipBorderColor] = useState("")
  const [themes, setThemes] = useState<AdminUserInterestedThemeDto[]>([])
  const [description, setDescription] = useState("")
  const [iconColor, setIconColor] = useState("#FFC01E")
  const [accessControl, setAccessControl] = useState<AdminPlaceListAccessControlDto>(
    AdminPlaceListAccessControlDto.Public,
  )
  const [places, setPlaces] = useState<AdminPlaceListPlaceDto[]>([])

  useEffect(() => {
    if (placeList) {
      setName(placeList.name)
      setChipText(placeList.nameChip?.text ?? "")
      setChipIconUrls(placeList.nameChip?.iconUrl ? [placeList.nameChip.iconUrl] : [])
      setChipBackgroundColor(placeList.nameChip?.backgroundColor ?? "")
      setChipBorderColor(placeList.nameChip?.borderColor ?? "")
      setThemes(placeList.themes)
      setDescription(placeList.description ?? "")
      setIconColor(placeList.iconColor ?? "#FFC01E")
      setAccessControl(placeList.accessControl)
      setPlaces(placeList.places)
    }
  }, [placeList])

  const toggleTheme = (theme: AdminUserInterestedThemeDto) => {
    setThemes((prev) => (prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]))
  }

  const handleSave = async () => {
    // 문구가 비면 아이콘/색 지정 여부와 무관하게 nameChip 전체를 null로 전송한다.
    // 서버 PlaceListNameChip.text는 blank를 허용하지 않으므로(require) 문구 없이 저장할 수 없다.
    const nameChip: AdminPlaceListNameChipDto | null = chipText.trim()
      ? {
          text: chipText.trim(),
          iconUrl: chipIconUrls[0] ?? null,
          backgroundColor: chipBackgroundColor || null,
          borderColor: chipBorderColor || null,
        }
      : null

    try {
      await updatePlaceList({
        id: placeListId,
        data: {
          name,
          // ponytail: openapi generator가 $ref 옆의 `nullable: true`를 무시해 생성 타입에 `| null`이 빠졌다.
          // 실제로는 null을 그대로 보내야 하므로(undefined면 필드 자체가 누락) 타입만 캐스팅한다.
          nameChip: nameChip as AdminPlaceListNameChipDto | undefined,
          themes,
          description: description || null,
          iconColor: iconColor || null,
          accessControl,
          placeIds: places.map((p) => p.placeId),
        },
      })
      toast.success("리스트가 수정되었습니다.")
      router.push("/placeList")
    } catch {
      toast.error("리스트 수정에 실패했습니다.")
    }
  }

  const handleDelete = async () => {
    if (!confirm(`정말 "${name}" 리스트를 삭제하시겠습니까?`)) {
      return
    }
    try {
      await deletePlaceList(placeListId)
      toast.success("리스트가 삭제되었습니다.")
      router.push("/placeList")
    } catch {
      toast.error("리스트 삭제에 실패했습니다.")
    }
  }

  const handleAddPlace = (searchedPlace: AdminSearchedPlaceDto) => {
    if (places.some((p) => p.placeId === searchedPlace.placeId)) {
      return
    }
    setPlaces([...places, {
      placeId: searchedPlace.placeId,
      name: searchedPlace.name,
      address: searchedPlace.address ?? null,
      location: searchedPlace.location,
      accessibilityScore: searchedPlace.accessibilityScore,
    }])
  }

  const handleRemovePlace = (placeId: string) => {
    setPlaces(places.filter((p) => p.placeId !== placeId))
  }

  if (isLoading) {
    return (
      <Contents.Normal>
        <div className="text-center py-8">로딩 중...</div>
      </Contents.Normal>
    )
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

            <div className="space-y-3 rounded-md border p-4">
              <div>
                <h4 className="text-sm font-semibold">이름칩</h4>
                <p className="text-xs text-muted-foreground">
                  검색 카드/장소상세/리스트상세에 공통으로 노출되는 칩입니다. 미지정 시 기본 칩 디자인으로 노출됩니다.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">칩 문구</label>
                <input
                  value={chipText}
                  onChange={(e) => setChipText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="예: 홍대핫플"
                />
                <p className="text-xs text-muted-foreground">
                  문구가 비어 있으면 이름칩 전체가 사라지며, 아래 아이콘/색상 지정도 함께 무시됩니다.
                </p>
              </div>

              <ImageUploader
                value={chipIconUrls}
                onChange={setChipIconUrls}
                purposeType={AdminImageUploadPurposeTypeDTO.Banner}
                maxImages={1}
                label="칩 아이콘"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">칩 배경색</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={chipBackgroundColor || "#FFFFFF"}
                    onChange={(e) => setChipBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <input
                    value={chipBackgroundColor}
                    onChange={(e) => setChipBackgroundColor(e.target.value)}
                    className="w-32 px-3 py-2 border rounded-md font-mono text-sm"
                    placeholder="미지정"
                  />
                  {chipBackgroundColor && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setChipBackgroundColor("")}>
                      지우기
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">칩 테두리색</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={chipBorderColor || "#FFFFFF"}
                    onChange={(e) => setChipBorderColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <input
                    value={chipBorderColor}
                    onChange={(e) => setChipBorderColor(e.target.value)}
                    className="w-32 px-3 py-2 border rounded-md font-mono text-sm"
                    placeholder="미지정"
                  />
                  {chipBorderColor && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setChipBorderColor("")}>
                      지우기
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">관심 테마</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {THEME_OPTIONS.map((theme) => (
                  <label key={theme} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={themes.includes(theme)} onCheckedChange={() => toggleTheme(theme)} />
                    {THEME_LABELS[theme]}
                  </label>
                ))}
              </div>
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
              initialPlaceLocations={places
                .filter((p) => p.location)
                .map((p) => ({
                  placeId: p.placeId,
                  name: p.name,
                  lat: p.location.lat,
                  lng: p.location.lng,
                  score: p.accessibilityScore ?? null,
                }))}
            />

            <h4 className="text-sm font-medium text-muted-foreground">
              추가된 장소 ({places.length}개)
            </h4>

            {places.length === 0 ? (
              <p className="text-sm text-muted-foreground">장소가 없습니다.</p>
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
        <div className="flex justify-between">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/placeList")}
              disabled={isUpdating || isDeleting}
            >
              취소
            </Button>
            <Button onClick={handleSave} disabled={isUpdating || isDeleting || !name.trim()}>
              {isUpdating ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </div>
    </Contents.Normal>
  )
}
