"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

import { useCreatePlaceList } from "@/lib/apis/placeList"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { Trash2 } from "lucide-react"

export default function PlaceListCreatePage() {
  const router = useRouter()
  const { mutateAsync: createPlaceList, isPending: isCreating } = useCreatePlaceList()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [placeIds, setPlaceIds] = useState<string[]>([])
  const [newPlaceId, setNewPlaceId] = useState("")

  const handleCreate = async () => {
    try {
      await createPlaceList({
        name,
        description: description || null,
        thumbnailUrl: thumbnailUrl || null,
        placeIds,
      })
      toast.success("리스트가 생성되었습니다.")
      router.push("/placeList")
    } catch {
      toast.error("리스트 생성에 실패했습니다.")
    }
  }

  const handleAddPlace = () => {
    const trimmed = newPlaceId.trim()
    if (!trimmed) return
    if (placeIds.includes(trimmed)) {
      alert("이미 추가된 장소입니다.")
      return
    }
    setPlaceIds([...placeIds, trimmed])
    setNewPlaceId("")
  }

  const handleRemovePlace = (id: string) => {
    setPlaceIds(placeIds.filter((p) => p !== id))
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
            <h3 className="text-lg font-semibold">장소 목록 ({placeIds.length}개)</h3>

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

            {placeIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">장소를 추가하세요.</p>
            ) : (
              <div className="space-y-2">
                {placeIds.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between px-3 py-2 border rounded-md"
                  >
                    <span className="text-sm">{id}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePlace(id)}
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
