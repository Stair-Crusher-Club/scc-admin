"use client"

import React from "react"
import {AccessibilitySummary, BuildingAccessibility, PlaceAccessibility} from "@/lib/models/accessibility";
import * as S from "@/(private)/accessibility/components/AccessibilityRow.style";
import { format } from "date-fns";
import {useModal} from "@/hooks/useModal";

interface Props {
  accessibilitySummary: AccessibilitySummary
  onDeletePlaceAccessibility: (accessibilitySummary: AccessibilitySummary) => void
  onDeleteBuildingAccessibility: (accessibilitySummary: AccessibilitySummary) => void
}
export default function AccessibilityRow(props: Props) {
  const {
    accessibilitySummary: accessibilitySummary,
    onDeletePlaceAccessibility,
    onDeleteBuildingAccessibility,
  } = props
  const { openModal } = useModal()

  const onClickImage = (imageUrl: string) => {
    openModal({ type: "AccessibilityImage", props: { imageUrl } })
  }

  return (
    <S.AccessibilityRow key={accessibilitySummary.placeAccessibility.id}>
      <S.Cell>{accessibilitySummary.placeAccessibility.placeName}</S.Cell>
      <S.Cell>{accessibilitySummary.placeAccessibility.registeredUserName || "익명의 정복자"}</S.Cell>
      <S.Cell>{format(accessibilitySummary.placeAccessibility.createdAtMillis, "yyyy-MM-dd HH:mm:ss")}</S.Cell>
      <S.Cell>
        {
          accessibilitySummary.placeAccessibility.imageUrls.map((imageUrl) => (
            <S.Image src={imageUrl} onClick={() => onClickImage(imageUrl)} />
          ))
        }
      </S.Cell>
      <S.Cell>
        {
          accessibilitySummary.buildingAccessibility?.imageUrls.map((imageUrl) => (
            <S.Image src={imageUrl} />
          ))
        }
      </S.Cell>
      <S.Cell>
        <S.DeleteButton onClick={() => onDeletePlaceAccessibility(accessibilitySummary)}>
          장소 정보 삭제
        </S.DeleteButton>
        {
          accessibilitySummary.buildingAccessibility
            ? (
              <S.DeleteButton onClick={() => onDeleteBuildingAccessibility(accessibilitySummary)}>
                건물 정보 삭제
              </S.DeleteButton>
            )
            : <S.DeleteButton disabled>건물 정보 없음</S.DeleteButton>
        }
      </S.Cell>
    </S.AccessibilityRow>
  )
}