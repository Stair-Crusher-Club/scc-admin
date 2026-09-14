"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

import { useCreateConquerTargetPlaceList } from "@/lib/apis/conquerTargetPlaceList"
import { parseDateInputAsEndOfDay, parseDateInputAsStartOfDay } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"

export default function ConquerTargetPlaceListCreatePage() {
  const router = useRouter()
  const { mutateAsync: createConquerTargetPlaceList, isPending: isCreating } = useCreateConquerTargetPlaceList()

  const [name, setName] = useState("")
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")

  const handleCreate = async () => {
    try {
      const created = await createConquerTargetPlaceList({
        name,
        startAt: startAt ? { value: parseDateInputAsStartOfDay(startAt) } : undefined,
        endAt: endAt ? { value: parseDateInputAsEndOfDay(endAt) } : undefined,
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
