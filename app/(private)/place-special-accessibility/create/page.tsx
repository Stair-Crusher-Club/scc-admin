"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { useCreatePlaceSpecialAccessibility } from "@/lib/apis/placeSpecialAccessibility"
import {
  AdminSearchedPlaceDto,
  CreatePlaceSpecialAccessibilityRequestDto,
  CreatePlaceSpecialAccessibilityRequestDtoAccessibilityTypeEnum,
  PlaceSpecialAccessibilityBbucleRoadTypeDto,
} from "@/lib/generated-sources/openapi"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { PlaceSearchPanel } from "../../placeList/components/PlaceSearchPanel"

import PSAForm, { PSAFormValues, SelectedPlaceInfo, defaultValues } from "../components/PSAForm"

export default function CreatePlaceSpecialAccessibility() {
  const router = useRouter()
  const { mutateAsync: create, isPending } = useCreatePlaceSpecialAccessibility()

  const form = useForm<PSAFormValues>({ defaultValues })
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlaceInfo | null>(null)

  const handleAddPlace = (place: AdminSearchedPlaceDto) => {
    form.setValue("placeId", place.placeId, { shouldValidate: true })
    setSelectedPlace({
      name: place.name,
      address: place.address ?? undefined,
    })
  }

  async function onSubmit(values: PSAFormValues) {
    const payload: CreatePlaceSpecialAccessibilityRequestDto = {
      placeId: values.placeId,
      accessibilityType: values.accessibilityType as CreatePlaceSpecialAccessibilityRequestDtoAccessibilityTypeEnum,
      bbucleRoadData: {
        bbucleRoadType: values.bbucleRoadType as PlaceSpecialAccessibilityBbucleRoadTypeDto,
        bbucleRoadUrl: values.bbucleRoadUrl,
        thumbnailImageUrl: values.thumbnailImageUrl,
      },
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
      <div className="space-y-6">
        {/* 장소 검색 */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">장소 검색</h3>
            <PlaceSearchPanel
              existingPlaceIds={form.watch("placeId") ? [form.watch("placeId")] : []}
              onAddPlace={handleAddPlace}
            />
          </CardContent>
        </Card>

        {/* PSA 폼 */}
        <PSAForm
          id="create-psa"
          form={form}
          onSubmit={onSubmit}
          isCreateMode={true}
          selectedPlace={selectedPlace}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/place-special-accessibility")} disabled={isPending}>
            취소
          </Button>
          <Button type="submit" form="create-psa" disabled={isPending}>
            {isPending ? "등록 중..." : "등록"}
          </Button>
        </div>
      </div>
    </Contents.Normal>
  )
}
