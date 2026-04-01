"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import {
  usePlaceSpecialAccessibility,
  useUpdatePlaceSpecialAccessibility,
  useDeletePlaceSpecialAccessibility,
} from "@/lib/apis/placeSpecialAccessibility"
import {
  UpdatePlaceSpecialAccessibilityRequestDto,
  PlaceSpecialAccessibilityBbucleRoadTypeDto,
} from "@/lib/generated-sources/openapi"

import { Button } from "@/components/ui/button"
import { Contents } from "@/components/layout"

import PSAForm, { PSAFormValues, defaultValues } from "../components/PSAForm"

export default function PlaceSpecialAccessibilityDetail() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = usePlaceSpecialAccessibility({ id })
  const { mutateAsync: update, isPending: isUpdating } = useUpdatePlaceSpecialAccessibility()
  const { mutateAsync: remove, isPending: isDeleting } = useDeletePlaceSpecialAccessibility()
  const [editMode, setEditMode] = useState(false)

  const formValues: PSAFormValues | undefined = data
    ? {
        placeId: data.placeId,
        accessibilityType: data.accessibilityType,
        bbucleRoadType: data.bbucleRoadData?.bbucleRoadType ?? "",
        bbucleRoadUrl: data.bbucleRoadData?.bbucleRoadUrl ?? "",
        thumbnailImageUrl: data.bbucleRoadData?.thumbnailImageUrl ?? "",
      }
    : undefined

  const form = useForm<PSAFormValues>({
    defaultValues,
    values: formValues,
  })

  async function onSubmit(values: PSAFormValues) {
    if (!editMode) return

    const payload: UpdatePlaceSpecialAccessibilityRequestDto = {
      bbucleRoadData: values.bbucleRoadType ? {
        bbucleRoadType: values.bbucleRoadType as PlaceSpecialAccessibilityBbucleRoadTypeDto,
        bbucleRoadUrl: values.bbucleRoadUrl,
        thumbnailImageUrl: values.thumbnailImageUrl,
      } : undefined,
    }

    try {
      await update({ id, data: payload })
      toast.success("장소 특수 접근성이 수정되었습니다.")
      setEditMode(false)
    } catch {
      toast.error("수정에 실패했습니다.")
    }
  }

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      await remove(id)
      toast.success("삭제되었습니다.")
      router.push("/place-special-accessibility")
    } catch {
      toast.error("삭제에 실패했습니다.")
    }
  }

  if (isLoading) {
    return (
      <Contents.Normal>
        <div className="text-center py-8">로딩 중...</div>
      </Contents.Normal>
    )
  }

  if (isError || !data) {
    return (
      <Contents.Normal>
        <div className="text-center py-8 text-red-500">데이터를 불러오는데 실패했습니다.</div>
      </Contents.Normal>
    )
  }

  return (
    <Contents.Normal>
      <PSAForm id="edit-psa" form={form} onSubmit={onSubmit} isEditMode={editMode} isCreateMode={false} />
      <div className="flex justify-between mt-4">
        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "삭제 중..." : "삭제"}
        </Button>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditMode(false)
                  if (formValues) {
                    form.reset(formValues)
                  }
                }}
              >
                취소
              </Button>
              <Button type="submit" form="edit-psa" disabled={isUpdating}>
                {isUpdating ? "저장 중..." : "저장"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>수정하기</Button>
          )}
        </div>
      </div>
    </Contents.Normal>
  )
}
