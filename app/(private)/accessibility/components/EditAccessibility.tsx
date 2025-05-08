import { Combobox, NumberInput } from "@reactleaf/input/hookform"
import React from "react"
import { FormProvider, UseFormReturn } from "react-hook-form"

import {
  AdminBuildingAccessibilityDTO,
  AdminEntranceDoorType,
  AdminPlaceAccessibilityDTO,
  AdminStairHeightLevel,
  AdminStairInfoDTO,
} from "@/lib/generated-sources/openapi"
import { FLOORS } from "@/lib/models/accessibility"

import * as S from "./EditAccessibility.style"

interface Option {
  label: string
  value: any
}

export const booleanOptions = [{ label: "예", value: true } as const, { label: "아니오", value: false } as const]

export const floorOptions = [
  { label: "1층에 있어요", value: FLOORS.FIRST } as const,
  { label: "1층이 아니에요", value: FLOORS.NOT_FIRST } as const,
  { label: "1~2층을 포함한 여러층이에요", value: FLOORS.MULTIPLE_INCLUDING_FIRST } as const,
]

export const stairInfoOptions = [
  { label: "없음", value: AdminStairInfoDTO.None } as const,
  { label: "1개", value: AdminStairInfoDTO.One } as const,
  { label: "2~5개", value: AdminStairInfoDTO.TwoToFive } as const,
  { label: "6개 이상", value: AdminStairInfoDTO.OverSix } as const,
]

export const stairHeightLevelOptions = [
  { label: "엄지 반 마디", value: AdminStairHeightLevel.HalfThumb } as const,
  { label: "엄지 한 마디", value: AdminStairHeightLevel.Thumb } as const,
  { label: "한 마디 이상", value: AdminStairHeightLevel.OverThumb } as const,
]

export const entranceDoorTypeOptions = [
  { label: "여닫이문", value: AdminEntranceDoorType.Hinged } as const,
  { label: "미닫이문", value: AdminEntranceDoorType.Sliding } as const,
  { label: "자동문", value: AdminEntranceDoorType.Automatic } as const,
  { label: "회전문", value: AdminEntranceDoorType.Revolving } as const,
  { label: "기타", value: AdminEntranceDoorType.Etc } as const,
  { label: "문 없음", value: AdminEntranceDoorType.None } as const,
]

export interface EditPlaceAccessibilityFormValues {
  isFirstFloor: Option
  floors?: Option
  floorNumber?: number
  isStairOnlyOption?: Option
  stairInfo: Option
  stairHeightLevel?: Option
  hasSlope: Option
  entranceDoorTypes?: Option[]
}

interface EditPlaceAccessibilityModalProps {
  isOpen: boolean
  onClose: () => void
  placeAccessibility: AdminPlaceAccessibilityDTO | null
  form: UseFormReturn<EditPlaceAccessibilityFormValues>
  onSubmit: (values: EditPlaceAccessibilityFormValues) => void
}

export interface EditBuildingAccessibilityFormValues {
  hasElevator: Option
  hasSlope: Option
  entranceStairInfo: Option
  entranceStairHeightLevel?: Option
  entranceDoorTypes?: Option[]
  elevatorStairInfo: Option
  elevatorStairHeightLevel?: Option
}

interface EditBuildingAccessibilityModalProps {
  isOpen: boolean
  onClose: () => void
  buildingAccessibility: AdminBuildingAccessibilityDTO | null
  form: UseFormReturn<EditBuildingAccessibilityFormValues>
  onSubmit: (values: EditBuildingAccessibilityFormValues) => void
}

export const EditPlaceAccessibilityModal: React.FC<EditPlaceAccessibilityModalProps> = ({
  isOpen,
  onClose,
  placeAccessibility,
  form,
  onSubmit,
}) => {
  if (!isOpen) return null

  const floors = form.watch("floors")
  const stairs = form.watch("stairInfo")
  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.CloseButton onClick={onClose}>x</S.CloseButton>
        <S.ModalHeader>
          <S.ModalHeaderTitle>장소 정보 수정</S.ModalHeaderTitle>
          <S.ModalHeaderBody>
            {placeAccessibility?.placeName} 정복자: {placeAccessibility?.registeredUserName}
          </S.ModalHeaderBody>
        </S.ModalHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <S.ModalBody>
              <S.ModalBodyRow>
                <Combobox name="floors" label="층 정보" options={floorOptions} />
                <Combobox
                  name="isFirstFloor"
                  label="1층에 있는 장소"
                  options={booleanOptions}
                  isDisabled={floors != undefined}
                />
              </S.ModalBodyRow>
              <S.ModalBodyRow>
                <NumberInput
                  name="floorNumber"
                  label="몇 층에 있는 장소인가요? (지하는 음수로 입력해주세요)"
                  disabled={!floors || floors.value != FLOORS.NOT_FIRST}
                />
                <Combobox
                  name="isStairOnlyOption"
                  label="2층 매장으로 가는 방법이 계단 뿐인가요?"
                  options={booleanOptions}
                  isDisabled={!floors || floors.value != FLOORS.MULTIPLE_INCLUDING_FIRST}
                />
              </S.ModalBodyRow>

              <S.ModalBodyRow>
                <Combobox name="stairInfo" label="입구 계단 정보" options={stairInfoOptions} />
                <Combobox
                  name="stairHeightLevel"
                  label="계단 1칸의 높이"
                  options={stairHeightLevelOptions}
                  isDisabled={!stairs || stairs.value != "ONE"}
                />
              </S.ModalBodyRow>
              <Combobox name="hasSlope" label="입구에 경사로가 있나요?" options={booleanOptions} />
              <Combobox isMulti={true} name="entranceDoorTypes" label="출입문 유형" options={entranceDoorTypeOptions} />
            </S.ModalBody>
            <S.ModalFooter>
              <S.CancelButton type="button" onClick={onClose}>
                취소
              </S.CancelButton>
              <S.SaveButton type="submit">저장</S.SaveButton>
            </S.ModalFooter>
          </form>
        </FormProvider>
      </S.ModalContent>
    </S.ModalOverlay>
  )
}

export const EditBuildingAccessibilityModal: React.FC<EditBuildingAccessibilityModalProps> = ({
  isOpen,
  onClose,
  buildingAccessibility,
  form,
  onSubmit,
}) => {
  if (!isOpen) return null

  const entranceStairs = form.watch("entranceStairInfo")
  const hasElevator = form.watch("hasElevator")
  const elevatorStairs = form.watch("elevatorStairInfo")

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.CloseButton onClick={onClose}>x</S.CloseButton>
        <S.ModalHeader>
          <S.ModalHeaderTitle>건물 정보 수정</S.ModalHeaderTitle>
          <S.ModalHeaderBody>
            {buildingAccessibility?.buildingName} 정복자: {buildingAccessibility?.registeredUserName}
          </S.ModalHeaderBody>
        </S.ModalHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <S.ModalBody>
              <Combobox name="hasSlope" label="입구에 경사로가 있나요?" options={booleanOptions} />
              <S.ModalBodyRow>
                <Combobox name="entranceStairInfo" label="입구에 계단이 있나요?" options={stairInfoOptions} />
                <Combobox
                  name="entranceStairHeightLevel"
                  label="입구 계단 1칸의 높이"
                  options={stairHeightLevelOptions}
                  isDisabled={!entranceStairs || entranceStairs.value != "ONE"}
                />
              </S.ModalBodyRow>
              <Combobox isMulti={true} name="entranceDoorTypes" label="출입문 유형" options={entranceDoorTypeOptions} />
              <Combobox name="hasElevator" label="엘리베이터가 있나요?" options={booleanOptions} />
              <S.ModalBodyRow>
                <Combobox
                  name="elevatorStairInfo"
                  label="엘리베이터까지의 계단 정보"
                  options={stairInfoOptions}
                  isDisabled={!hasElevator || hasElevator.value == false}
                />
                <Combobox
                  name="elevatorStairHeightLevel"
                  label="엘리베이터까지의 계단 1칸 높이"
                  options={stairHeightLevelOptions}
                  isDisabled={!elevatorStairs || elevatorStairs.value != "ONE"}
                />
              </S.ModalBodyRow>
            </S.ModalBody>
            <S.ModalFooter>
              <S.CancelButton type="button" onClick={onClose}>
                취소
              </S.CancelButton>
              <S.SaveButton type="submit">저장</S.SaveButton>
            </S.ModalFooter>
          </form>
        </FormProvider>
      </S.ModalContent>
    </S.ModalOverlay>
  )
}
