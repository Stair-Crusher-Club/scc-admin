import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import {
  SearchAccessibilitiesPayload,
  SearchAccessibilitiesResult,
  UpdateBuildingAccessibilityPayload,
  UpdatePlaceAccessibilityPayload,
  deleteBuildingAccessibility,
  deletePlaceAccessibility,
  updatePlaceAccessibility,
} from "@/lib/apis/api"
import { NetworkError } from "@/lib/http"
import { AccessibilitySummary, FLOORS } from "@/lib/models/accessibility"

import { useModal } from "@/hooks/useModal"

import * as S from "./Cells.style"
import {
  EditBuildingAccessibilityFormValues,
  EditBuildingAccessibilityModal,
  EditPlaceAccessibilityFormValues,
  EditPlaceAccessibilityModal,
  booleanOptions,
  entranceDoorTypeOptions,
  floorOptions,
  stairHeightLevelOptions,
  stairInfoOptions,
} from "./EditAccessibility"

export function ImagesCell({ images }: { images: string[] }) {
  const { openModal } = useModal()
  function seeDetails(url: string) {
    openModal({ type: "AccessibilityImage", props: { imageUrl: url } })
  }

  if (images.length === 1) {
    const imageUrl = images[0]
    return (
      <S.ImagesGrid>
        <Image
          key={imageUrl}
          src={imageUrl}
          width={200}
          height={200}
          alt=""
          style={{ gridRow: "1/3", gridColumn: "1/3" }}
          onClick={() => seeDetails(imageUrl)}
          unoptimized
        />
      </S.ImagesGrid>
    )
  }

  return (
    <S.ImagesGrid>
      {images.map((imageUrl) => (
        <Image key={imageUrl} src={imageUrl} alt="" width={98} height={98} onClick={() => seeDetails(imageUrl)} />
      ))}
      {Array.from({ length: 4 - images.length }).map((_, idx) => (
        <div key={idx} style={{ backgroundColor: "#eee" }} />
      ))}
    </S.ImagesGrid>
  )
}

export function ActionsCell({
  accessibility,
  ctx,
}: {
  accessibility: AccessibilitySummary
  ctx?: SearchAccessibilitiesPayload
}) {
  const queryClient = useQueryClient()
  const [isPlaceAccessibilityModalOpen, setIsPlaceAccessibilityModalOpen] = useState(false)
  const [isBuildingAccessibilityModalOpen, setIsBuildingAccessibilityModalOpen] = useState(false)
  const [selectedAccessibility, setSelectedAccessibility] = useState<AccessibilitySummary | null>(null)

  async function handleDeletePlaceAccessibility() {
    const { id, placeName } = accessibility.placeAccessibility
    if (!confirm(`정말 [${placeName}]의 장소 정보를 삭제하시겠습니까?`)) return
    await deletePlaceAccessibility({ id })
    toast.success(`[${placeName}]의 장소 정보가 삭제되었습니다.`)

    // Refresh 하지는 않고 client 데이터에서 삭제
    queryClient.setQueryData(["@accessibilities", ctx], (data: InfiniteData<SearchAccessibilitiesResult>) => {
      const newPages = data.pages.map((page) => ({
        ...page,
        items: page.items.filter((it) => it.placeAccessibility.id !== id),
      }))
      return { ...data, pages: newPages }
    })
  }

  async function handleDeleteBuildingAccessibility() {
    const id = accessibility.buildingAccessibility?.id
    const placeName = accessibility.placeAccessibility.placeName
    if (!id) return
    if (!confirm(`정말 [${placeName}]의 건물 정보를 삭제하시겠습니까?`)) return
    await deleteBuildingAccessibility({ id })
    toast.success(`[${placeName}]의 건물 정보가 삭제되었습니다.`)

    // Refresh 하지는 않고 client 데이터에서 삭제
    queryClient.setQueryData(["@accessibilities", ctx], (data: InfiniteData<SearchAccessibilitiesResult>) => {
      const newPages = data.pages.map((page) => ({
        ...page,
        items: page.items.map((it) =>
          it.buildingAccessibility?.id === id ? { ...it, buildingAccessibility: undefined } : it,
        ),
      }))
      return { ...data, pages: newPages }
    })
  }

  const convertFloorOptions = (floors?: number[]) => {
    if (!floors || floors.length === 0) return undefined
    if (floors.length === 2 && floors.includes(1) && floors.includes(2))
      return floorOptions.find((v) => v.value === FLOORS.MULTIPLE_INCLUDING_FIRST)
    if (floors.length === 1 && floors[0] === 1) return floorOptions.find((v) => v.value === FLOORS.FIRST)
    return floorOptions.find((v) => v.value === FLOORS.NOT_FIRST)
  }

  const editPlaceAccessibilityForm = useForm<EditPlaceAccessibilityFormValues>()
  useEffect(() => {
    if (!selectedAccessibility || !isPlaceAccessibilityModalOpen) return

    editPlaceAccessibilityForm.reset({
      isFirstFloor: booleanOptions.find((v) => v.value === selectedAccessibility.placeAccessibility?.isFirstFloor),
      floors: convertFloorOptions(selectedAccessibility.placeAccessibility?.floors),
      floorNumber: selectedAccessibility.placeAccessibility?.floors?.[0],
      isStairOnlyOption: booleanOptions.find(
        (v) => v.value === selectedAccessibility.placeAccessibility?.isStairOnlyOption,
      ),
      stairInfo: stairInfoOptions.find((v) => v.value === selectedAccessibility.placeAccessibility?.stairInfo),
      stairHeightLevel: stairHeightLevelOptions.find(
        (v) => v.value === selectedAccessibility.placeAccessibility?.stairHeightLevel,
      ),
      hasSlope: booleanOptions.find((v) => v.value === selectedAccessibility.placeAccessibility?.hasSlope),
      entranceDoorTypes: entranceDoorTypeOptions.filter((v) =>
        selectedAccessibility.placeAccessibility?.entranceDoorTypes?.includes(v.value),
      ),
    })
  }, [selectedAccessibility])

  const editBuildingAccessibilityForm = useForm<EditBuildingAccessibilityFormValues>()
  useEffect(() => {
    if (!selectedAccessibility || !isBuildingAccessibilityModalOpen) return

    // editBuildingAccessibilityForm.reset({
    //   hasElevator: selectedAccessibility.buildingAccessibility?.hasElevator,
    //   hasSlope: selectedAccessibility.buildingAccessibility?.hasSlope,
    //   entranceStairInfo: selectedAccessibility.buildingAccessibility?.entranceStairInfo,
    //   entranceStairHeightLevel: selectedAccessibility.buildingAccessibility?.entranceStairHeightLevel,
    //   entranceDoorTypes: selectedAccessibility.buildingAccessibility?.entranceDoorTypes,
    //   elevatorStairInfo: selectedAccessibility.buildingAccessibility?.elevatorStairInfo,
    //   elevatorStairHeightLevel: selectedAccessibility.buildingAccessibility?.elevatorStairHeightLevel,
    // })
  }, [selectedAccessibility])

  async function handleUpdatePlaceAccessibility(formValues: EditPlaceAccessibilityFormValues) {
    if (!selectedAccessibility) return
    const { id, placeName } = selectedAccessibility.placeAccessibility

    let isFirstFloor: boolean
    if (formValues.floors !== undefined) {
      isFirstFloor = formValues.floors.value === FLOORS.FIRST
    } else {
      isFirstFloor = formValues.isFirstFloor.value
    }

    let floors: number[] | undefined
    if (formValues.floors === undefined) {
      floors = undefined
    } else if (formValues.floors.value === FLOORS.MULTIPLE_INCLUDING_FIRST) {
      floors = [1, 2]
    } else {
      if (formValues.floorNumber === undefined) {
        toast.error("층수를 입력해주세요.")
        return
      }
      if (formValues.floorNumber === 0 || Number.isInteger(formValues.floorNumber) === false) {
        toast.error("층수는 0이 아닌 정수여야 합니다.")
        return
      }
      floors = [formValues.floorNumber]
    }

    let entranceDoorTypes
    if (!formValues.entranceDoorTypes || formValues.entranceDoorTypes.length === 0) {
      entranceDoorTypes = undefined
    } else {
      entranceDoorTypes = formValues.entranceDoorTypes.map((v) => v.value)
    }

    const data: UpdatePlaceAccessibilityPayload = {
      isFirstFloor: isFirstFloor,
      floors: floors,
      isStairOnlyOption: formValues.isStairOnlyOption?.value,
      stairInfo: formValues.stairInfo.value,
      stairHeightLevel: formValues.stairHeightLevel?.value,
      hasSlope: formValues.hasSlope.value,
      entranceDoorTypes: entranceDoorTypes,
    }

    try {
      await updatePlaceAccessibility({ id, payload: data })
      toast.success(`[${placeName}]의 장소 정보가 수정되었습니다.`)
    } catch (e) {
      if (e instanceof NetworkError) {
        const error = await e.response.json()
        toast.error(`[${placeName}]의 장소 정보 수정에 실패했습니다.`)
        toast.error(`${error.msg}`)
      } else {
        toast.error("네트워크 에러가 발생했습니다.")
      }
    }
  }

  const handleUpdateBuildingAccessibility = (formValues: EditBuildingAccessibilityFormValues) => {
    // Implement save logic here
    console.log("Updated Building Accessibility:", formValues)
    // You can add logic to update the accessibility list or make an API call to save the changes
  }

  return (
    <>
      <S.Actions>
        <S.EditButton
          onClick={() => {
            setSelectedAccessibility(accessibility)
            setIsPlaceAccessibilityModalOpen(true)
          }}
        >
          장소 정보 수정
        </S.EditButton>
        <S.DeleteButton onClick={handleDeletePlaceAccessibility}>장소 정보 삭제</S.DeleteButton>
        <S.EditButton
          disabled={!accessibility.buildingAccessibility}
          onClick={() => {
            setSelectedAccessibility(accessibility)
            setIsBuildingAccessibilityModalOpen(true)
          }}
        >
          {accessibility.buildingAccessibility ? "건물 정보 수정" : "건물 정보 없음"}
        </S.EditButton>
        <S.DeleteButton disabled={!accessibility.buildingAccessibility} onClick={handleDeleteBuildingAccessibility}>
          {accessibility.buildingAccessibility ? "건물 정보 삭제" : "건물 정보 없음"}
        </S.DeleteButton>
      </S.Actions>

      <EditPlaceAccessibilityModal
        isOpen={isPlaceAccessibilityModalOpen}
        onClose={() => {
          setSelectedAccessibility(null)
          setIsPlaceAccessibilityModalOpen(false)
        }}
        placeAccessibility={selectedAccessibility?.placeAccessibility ?? null}
        form={editPlaceAccessibilityForm}
        onSubmit={handleUpdatePlaceAccessibility}
      />

      <EditBuildingAccessibilityModal
        isOpen={isBuildingAccessibilityModalOpen}
        onClose={() => {
          setSelectedAccessibility(null)
          setIsBuildingAccessibilityModalOpen(false)
        }}
        buildingAccessibility={selectedAccessibility?.buildingAccessibility ?? null}
        form={editBuildingAccessibilityForm}
        onSubmit={handleUpdateBuildingAccessibility}
      />
    </>
  )
}
