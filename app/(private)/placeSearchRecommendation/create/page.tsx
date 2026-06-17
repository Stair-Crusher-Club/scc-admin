"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

import {
  AdminPlaceSearchRecommendationTypeDto,
  AdminCreatePlaceSearchRecommendationRequestDto,
} from "@/lib/generated-sources/openapi"
import { useCreatePlaceSearchRecommendation } from "@/lib/apis/placeSearchRecommendation"
import { usePlaceLists } from "@/lib/apis/placeList"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PlaceSearchRecommendationCreatePage() {
  const router = useRouter()
  const { mutateAsync: createRecommendation, isPending: isCreating } = useCreatePlaceSearchRecommendation()
  const { data: placeLists } = usePlaceLists()

  const [name, setName] = useState("")
  const [placeListId, setPlaceListId] = useState("")
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")

  const handleCreate = async () => {
    if (!placeListId) {
      toast.error("저장리스트를 선택해주세요.")
      return
    }
    try {
      const payload: AdminCreatePlaceSearchRecommendationRequestDto = {
        type: AdminPlaceSearchRecommendationTypeDto.RegionBased,
        name,
        placeListId,
        startAt: startAt ? { value: new Date(startAt).getTime() } : undefined,
        endAt: endAt ? { value: new Date(endAt).getTime() } : undefined,
      }
      await createRecommendation(payload)
      toast.success("검색 추천이 생성되었습니다.")
      router.push("/placeSearchRecommendation")
    } catch {
      toast.error("검색 추천 생성에 실패했습니다.")
    }
  }

  return (
    <Contents.Normal>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">검색 추천 추가</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">타입</label>
            <div className="px-3 py-2 border rounded-md bg-muted text-sm text-muted-foreground w-48">
              지역 기반 (REGION_BASED)
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              이름 <span className="text-red-500">*</span>
              <span className="text-muted-foreground text-xs ml-1">(최대 8자, 칩에 표시)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="예: 홍대 핫플"
              maxLength={8}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              저장리스트 <span className="text-red-500">*</span>
            </label>
            <Select value={placeListId} onValueChange={setPlaceListId}>
              <SelectTrigger className="w-80">
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
            <p className="text-xs text-muted-foreground">
              ⚠️ 장소 3개 이상 포함된 저장리스트를 선택해야 추천 영역(폴리곤)이
              계산됩니다. 장소가 3개 미만이면 칩이 노출되지 않습니다.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              노출 시작 <span className="text-muted-foreground text-xs">(비워두면 즉시 노출)</span>
            </label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              노출 종료 <span className="text-muted-foreground text-xs">(비워두면 무기한 노출)</span>
            </label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          variant="outline"
          onClick={() => router.push("/placeSearchRecommendation")}
          disabled={isCreating}
        >
          취소
        </Button>
        <Button
          onClick={handleCreate}
          disabled={isCreating || !name.trim() || !placeListId}
        >
          {isCreating ? "생성 중..." : "생성"}
        </Button>
      </div>
    </Contents.Normal>
  )
}
