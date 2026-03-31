"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { useCreatePlaceSpecialAccessibility } from "@/lib/apis/placeSpecialAccessibility"
import {
  CreatePlaceSpecialAccessibilityRequestDto,
  CreatePlaceSpecialAccessibilityRequestDtoAccessibilityTypeEnum,
  CreatePlaceSpecialAccessibilityRequestDtoBbucleRoadTypeEnum,
} from "@/lib/generated-sources/openapi"

import { Button } from "@/components/ui/button"
import { Contents } from "@/components/layout"

import PSAForm, { PSAFormValues, defaultValues } from "../components/PSAForm"

export default function CreatePlaceSpecialAccessibility() {
  const router = useRouter()
  const { mutateAsync: create, isPending } = useCreatePlaceSpecialAccessibility()

  const form = useForm<PSAFormValues>({ defaultValues })

  async function onSubmit(values: PSAFormValues) {
    const payload: CreatePlaceSpecialAccessibilityRequestDto = {
      placeId: values.placeId,
      accessibilityType: values.accessibilityType as CreatePlaceSpecialAccessibilityRequestDtoAccessibilityTypeEnum,
      bbucleRoadType: values.bbucleRoadType as CreatePlaceSpecialAccessibilityRequestDtoBbucleRoadTypeEnum,
      bbucleRoadUrl: values.bbucleRoadUrl,
      thumbnailImageUrl: values.thumbnailImageUrl,
    }

    try {
      await create(payload)
      toast.success("장소 특수 접근성이 생성되었습니다.")
      router.push("/place-special-accessibility")
    } catch {
      toast.error("생성에 실패했습니다.")
    }
  }

  return (
    <Contents.Normal>
      <PSAForm id="create-psa" form={form} onSubmit={onSubmit} />
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={() => router.push("/place-special-accessibility")} disabled={isPending}>
          취소
        </Button>
        <Button type="submit" form="create-psa" disabled={isPending}>
          {isPending ? "등록 중..." : "등록"}
        </Button>
      </div>
    </Contents.Normal>
  )
}
