"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

import { useCreateConquerTargetPlaceList } from "@/lib/apis/conquerTargetPlaceList"
import { parseDateInputAsEndOfDay, parseDateInputAsStartOfDay } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"

import { MarkerSvgInput } from "../components/MarkerSvgInput"

export default function ConquerTargetPlaceListCreatePage() {
  const router = useRouter()
  const { mutateAsync: createConquerTargetPlaceList, isPending: isCreating } = useCreateConquerTargetPlaceList()

  const [name, setName] = useState("")
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [defaultSvg, setDefaultSvg] = useState("")
  const [focusedSvg, setFocusedSvg] = useState("")

  const handleCreate = async () => {
    try {
      const created = await createConquerTargetPlaceList({
        name,
        startAt: startAt ? { value: parseDateInputAsStartOfDay(startAt) } : undefined,
        endAt: endAt ? { value: parseDateInputAsEndOfDay(endAt) } : undefined,
        displayName: displayName.trim() || undefined,
        markerIcon: defaultSvg.trim()
          ? { defaultSvg: defaultSvg.trim(), focusedSvg: focusedSvg.trim() || undefined }
          : undefined,
      })
      toast.success("리스트가 생성되었습니다.")
      router.push(`/conquerTargetPlaceList/${created.id}`)
    } catch {
      toast.error("리스트 생성에 실패했습니다.")
    }
  }

  return (
    <Contents.Normal>
      <div className="space-y-6">
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
                placeholder="예: 서울 올리브영"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">시작일</label>
                <input
                  type="date"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">종료일</label>
                <input
                  type="date"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">앱 노출 설정</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">표시명</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="올리브영"
              />
              <p className="text-xs text-muted-foreground">
                앱에 &apos;{"{표시명}"} 정복하기&apos;, &apos;N번째 {"{표시명}"} 정복 완료!&apos; 처럼 브랜드명 단독으로
                노출됩니다. 비우면 목록 이름이 그대로 쓰입니다.
              </p>
            </div>

            <div className="space-y-2">
              <MarkerSvgInput
                label="마커 아이콘 (기본)"
                value={defaultSvg}
                onChange={setDefaultSvg}
                placeholder="<svg>...</svg>"
              />
              <MarkerSvgInput
                label="마커 아이콘 (선택 상태, 비우면 기본 재사용)"
                value={focusedSvg}
                onChange={setFocusedSvg}
                placeholder="<svg>...</svg>"
              />
              <p className="text-xs text-muted-foreground">
                앱 지도 마커로 그대로 쓰입니다. SVG 안의 #9A9B9F 는 접근레벨 색으로 자동 치환되므로, 정복/미정복 색
                구분을 원하면 그 색을 placeholder 로 쓰세요. 256KB 이하.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push("/conquerTargetPlaceList")} disabled={isCreating}>
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
