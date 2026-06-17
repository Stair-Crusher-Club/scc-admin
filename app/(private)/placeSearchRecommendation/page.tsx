"use client"

import { format as formatDate } from "date-fns"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

import {
  AdminPlaceSearchRecommendationDto,
  AdminPlaceSearchRecommendationTypeDto,
  AdminUpdatePlaceSearchRecommendationRequestDto,
} from "@/lib/generated-sources/openapi"
import {
  useDeletePlaceSearchRecommendation,
  usePlaceSearchRecommendationsInfinite,
  useUpdatePlaceSearchRecommendation,
} from "@/lib/apis/placeSearchRecommendation"
import { usePlaceLists } from "@/lib/apis/placeList"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { PageActions } from "@/components/page-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const dateFormat = "yyyy.MM.dd HH:mm"

const TYPE_LABELS: Record<AdminPlaceSearchRecommendationTypeDto, string> = {
  REGION_BASED: "지역 기반",
}

interface EditState {
  id: string
  name: string
  placeListId: string
  startAt: string
  endAt: string
}

export default function PlaceSearchRecommendationPage() {
  const router = useRouter()
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePlaceSearchRecommendationsInfinite()
  const { data: placeLists } = usePlaceLists()
  const { mutateAsync: updateRecommendation, isPending: isUpdating } = useUpdatePlaceSearchRecommendation()
  const { mutateAsync: deleteRecommendation, isPending: isDeleting } = useDeletePlaceSearchRecommendation()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)

  const items = data?.pages.flatMap((page) => page.items) ?? []

  const handleEdit = (item: AdminPlaceSearchRecommendationDto) => {
    setEditingId(item.id)
    setEditState({
      id: item.id,
      name: item.name,
      placeListId: item.placeListId,
      startAt: item.startAt ? formatDate(new Date(item.startAt.value), "yyyy-MM-dd'T'HH:mm") : "",
      endAt: item.endAt ? formatDate(new Date(item.endAt.value), "yyyy-MM-dd'T'HH:mm") : "",
    })
  }

  const handleSave = async () => {
    if (!editState) return
    try {
      const payload: AdminUpdatePlaceSearchRecommendationRequestDto = {
        type: AdminPlaceSearchRecommendationTypeDto.RegionBased,
        name: editState.name,
        placeListId: editState.placeListId,
        startAt: editState.startAt ? { value: new Date(editState.startAt).getTime() } : undefined,
        endAt: editState.endAt ? { value: new Date(editState.endAt).getTime() } : undefined,
      }
      await updateRecommendation({ id: editState.id, data: payload })
      toast.success("검색 추천이 수정되었습니다.")
      setEditingId(null)
      setEditState(null)
    } catch {
      toast.error("검색 추천 수정에 실패했습니다.")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditState(null)
  }

  const handleDelete = async (item: AdminPlaceSearchRecommendationDto) => {
    if (!confirm(`정말 "${item.name}" 검색 추천을 삭제하시겠습니까?`)) {
      return
    }
    try {
      await deleteRecommendation(item.id)
      toast.success("검색 추천이 삭제되었습니다.")
    } catch {
      toast.error("검색 추천 삭제에 실패했습니다.")
    }
  }

  return (
    <Contents.Normal>
      <PageActions>
        <Button onClick={() => router.push("/placeSearchRecommendation/create")} size="sm">
          새 검색 추천 추가
        </Button>
      </PageActions>
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>저장리스트</TableHead>
                    <TableHead>타입</TableHead>
                    <TableHead>노출 시작</TableHead>
                    <TableHead>노출 종료</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      {editingId === item.id && editState ? (
                        <>
                          <TableCell>
                            <input
                              value={editState.name}
                              onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                              className="w-full px-2 py-1 border rounded-md text-sm"
                              maxLength={8}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editState.placeListId}
                              onValueChange={(value) => setEditState({ ...editState, placeListId: value })}
                            >
                              <SelectTrigger className="w-48 text-sm">
                                <SelectValue placeholder="저장리스트 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {(placeLists ?? []).map((pl) => (
                                  <SelectItem key={pl.id} value={pl.id}>
                                    {pl.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {TYPE_LABELS[item.type]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <input
                              type="datetime-local"
                              value={editState.startAt}
                              onChange={(e) => setEditState({ ...editState, startAt: e.target.value })}
                              className="px-2 py-1 border rounded-md text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="datetime-local"
                              value={editState.endAt}
                              onChange={(e) => setEditState({ ...editState, endAt: e.target.value })}
                              className="px-2 py-1 border rounded-md text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isUpdating || !editState.name.trim()}
                              >
                                저장
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                취소
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {item.placeListName ?? item.placeListId}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {TYPE_LABELS[item.type]}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {item.startAt
                              ? formatDate(new Date(item.startAt.value), dateFormat)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {item.endAt
                              ? formatDate(new Date(item.endAt.value), dateFormat)
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(item)}
                              >
                                수정
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(item)}
                                disabled={isDeleting}
                              >
                                삭제
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {hasNextPage && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "로딩 중..." : "더 보기"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Contents.Normal>
  )
}
