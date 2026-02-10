"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { AdminPlaceListPlaceDto } from "@/lib/generated-sources/openapi"
import {
  usePlaceListDetail,
  useUpdatePlaceList,
  useDeletePlaceList,
} from "@/lib/apis/placeList"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { Trash2 } from "lucide-react"

export default function PlaceListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const placeListId = params.id as string

  const { data: placeList, isLoading } = usePlaceListDetail({ id: placeListId })
  const { mutateAsync: updatePlaceList, isPending: isUpdating } = useUpdatePlaceList()
  const { mutateAsync: deletePlaceList, isPending: isDeleting } = useDeletePlaceList()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [places, setPlaces] = useState<AdminPlaceListPlaceDto[]>([])
  const [newPlaceId, setNewPlaceId] = useState("")

  useEffect(() => {
    if (placeList) {
      setName(placeList.name)
      setDescription(placeList.description ?? "")
      setThumbnailUrl(placeList.thumbnailUrl ?? "")
      setPlaces(placeList.places)
    }
  }, [placeList])

  const handleSave = async () => {
    await updatePlaceList({
      id: placeListId,
      data: {
        name,
        description: description || null,
        thumbnailUrl: thumbnailUrl || null,
        placeIds: places.map((p) => p.placeId),
      },
    })
    alert("리스트가 수정되었습니다.")
    router.push("/placeList")
  }

  const handleDelete = async () => {
    if (!confirm(`정말 "${name}" 리스트를 삭제하시겠습니까?`)) {
      return
    }
    await deletePlaceList(placeListId)
    alert("리스트가 삭제되었습니다.")
    router.push("/placeList")
  }

  const handleAddPlace = () => {
    const trimmed = newPlaceId.trim()
    if (!trimmed) return
    if (places.some((p) => p.placeId === trimmed)) {
      alert("이미 추가된 장소입니다.")
      return
    }
    setPlaces([...places, { placeId: trimmed, name: trimmed, address: null }])
    setNewPlaceId("")
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
              <label className="text-sm font-medium">썸네일 URL</label>
              <input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Places */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">장소 목록 ({places.length}개)</h3>

            <div className="flex gap-2">
              <input
                value={newPlaceId}
                onChange={(e) => setNewPlaceId(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="장소 ID 입력"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddPlace()
                  }
                }}
              />
              <Button type="button" onClick={handleAddPlace} size="sm">
                추가
              </Button>
            </div>

            {places.length === 0 ? (
              <p className="text-sm text-muted-foreground">장소가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {places.map((place) => (
                  <div
                    key={place.placeId}
                    className="flex items-center justify-between px-3 py-2 border rounded-md"
                  >
                    <div>
                      <span className="font-medium">{place.name}</span>
                      {place.address && (
                        <span className="text-sm text-muted-foreground ml-2">{place.address}</span>
                      )}
                      <span className="text-xs text-muted-foreground ml-2">({place.placeId})</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePlace(place.placeId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
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
