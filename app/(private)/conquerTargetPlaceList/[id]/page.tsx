"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

import { AdminAddPlacesToConquerTargetPlaceListResponseDto } from "@/lib/generated-sources/openapi"
import {
  useAddPlacesToConquerTargetPlaceList,
  useConquerTargetPlaceListDetail,
  useConquerTargetPlaceListPlaces,
  useDeleteConquerTargetPlaceList,
  useUpdateConquerTargetPlaceList,
} from "@/lib/apis/conquerTargetPlaceList"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { DataTable } from "@/components/ui/data-table"
import { Textarea } from "@/components/ui/textarea"

import { getPlaceColumns } from "../components/columns"

function parsePlaceIds(text: string): string[] {
  const ids = text
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
  return Array.from(new Set(ids))
}

export default function ConquerTargetPlaceListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const placeListId = params.id as string

  const { data: placeList, isLoading } = useConquerTargetPlaceListDetail({ id: placeListId })
  const { data: placesData, fetchNextPage, hasNextPage } = useConquerTargetPlaceListPlaces({ id: placeListId })
  const { mutateAsync: updatePlaceList, isPending: isUpdatingName } = useUpdateConquerTargetPlaceList()
  const { mutateAsync: deletePlaceList, isPending: isDeleting } = useDeleteConquerTargetPlaceList()
  const { mutateAsync: addPlaces, isPending: isAdding } = useAddPlacesToConquerTargetPlaceList()

  const [name, setName] = useState("")
  const [placeIdsText, setPlaceIdsText] = useState("")
  const [addResult, setAddResult] = useState<AdminAddPlacesToConquerTargetPlaceListResponseDto | null>(null)

  useEffect(() => {
    if (placeList) {
      setName(placeList.name)
    }
  }, [placeList])

  const parsedPlaceIds = useMemo(() => parsePlaceIds(placeIdsText), [placeIdsText])

  const handleSaveName = async () => {
    try {
      await updatePlaceList({ id: placeListId, data: { name } })
      toast.success("이름이 수정되었습니다.")
    } catch {
      toast.error("이름 수정에 실패했습니다.")
    }
  }

  const handleDelete = async () => {
    if (!confirm(`정말 "${name}" 리스트를 삭제하시겠습니까?`)) {
      return
    }
    try {
      await deletePlaceList(placeListId)
      toast.success("리스트가 삭제되었습니다.")
      router.push("/conquerTargetPlaceList")
    } catch {
      toast.error("리스트 삭제에 실패했습니다.")
    }
  }

  const handleAddPlaces = async () => {
    if (parsedPlaceIds.length === 0) return
    try {
      const result = await addPlaces({ id: placeListId, placeIds: parsedPlaceIds })
      setAddResult(result)
      toast.success(
        `추가 ${result.addedCount}건 / 이미 있음 ${result.alreadyExistingPlaceIds.length}건 / 없는 ID ${result.notFoundPlaceIds.length}건`,
      )
      setPlaceIdsText("")
    } catch {
      toast.error("장소 추가에 실패했습니다.")
    }
  }

  if (isLoading || !placeList) {
    return (
      <Contents.Normal>
        <div className="text-center py-8">로딩 중...</div>
      </Contents.Normal>
    )
  }

  const columns = getPlaceColumns(placeListId)
  const totalCount = placeList.placeCount
  const conqueredCount = placeList.conqueredPlaceCount
  const conqueredPercent = totalCount > 0 ? Math.round((conqueredCount / totalCount) * 100) : 0
  const places = placesData?.pages.flatMap((p) => p.items) ?? []

  return (
    <Contents.Normal>
      <div className="space-y-6">
        {/* 이름 수정 */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
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
              <Button onClick={handleSaveName} disabled={isUpdatingName || !name.trim() || name === placeList.name}>
                {isUpdatingName ? "저장 중..." : "저장"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 장소 일괄 추가 */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">장소 일괄 추가</h3>
            <Textarea
              value={placeIdsText}
              onChange={(e) => setPlaceIdsText(e.target.value)}
              rows={6}
              placeholder="placeId 를 줄바꿈 또는 콤마로 구분해 붙여넣으세요"
            />
            <div className="flex justify-end">
              <Button onClick={handleAddPlaces} disabled={isAdding || parsedPlaceIds.length === 0}>
                {isAdding ? "추가 중..." : `${parsedPlaceIds.length}개 추가`}
              </Button>
            </div>

            {addResult && addResult.notFoundPlaceIds.length > 0 && (
              <div className="rounded-md border border-destructive/50 p-4 space-y-2">
                <p className="text-sm font-medium text-destructive">
                  존재하지 않는 placeId {addResult.notFoundPlaceIds.length}건 (오타를 확인하세요)
                </p>
                <div className="text-xs text-muted-foreground break-all">{addResult.notFoundPlaceIds.join(", ")}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 멤버 장소 목록 */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">장소 목록</h3>
              <div className="text-sm text-muted-foreground">
                정복 {conqueredCount} / 전체 {totalCount} ({conqueredPercent}%)
              </div>
            </div>

            {totalCount === 0 ? (
              <p className="text-sm text-muted-foreground">장소가 없습니다.</p>
            ) : (
              <DataTable columns={columns} data={places} hasMore={!!hasNextPage} onLoadMore={() => fetchNextPage()} />
            )}
          </CardContent>
        </Card>

        {/* 삭제 */}
        <div className="flex justify-start">
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "삭제 중..." : "리스트 삭제"}
          </Button>
        </div>
      </div>
    </Contents.Normal>
  )
}
