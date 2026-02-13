import { Combobox, NumberInput } from "@reactleaf/input/hookform"
import { BasicModalProps } from "@reactleaf/modal"
import { format } from "date-fns"
import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { useAccessibilityReportDetail, useResolveAccessibilityReport } from "@/lib/apis/accessibilityReport"
import {
  AdminResolveAccessibilityReportRequestDTOActionEnum,
  type AdminResolveAccessibilityReportRequestDTO,
  type AdminUpdateBuildingAccessibilityRequestDTO,
  type AdminUpdatePlaceAccessibilityRequestDTO,
} from "@/lib/generated-sources/openapi"
import {
  booleanOptions,
  entranceDoorTypeOptions,
  floorOptions,
  stairHeightLevelOptions,
  stairInfoOptions,
  type EditBuildingAccessibilityFormValues,
  type EditPlaceAccessibilityFormValues,
} from "@/(private)/accessibility/components/EditAccessibility"
import RightSheet from "../_template/RightSheet"

interface Props extends BasicModalProps {
  reportId: string
}

const targetTypeLabels: Record<string, string> = {
  PLACE_ACCESSIBILITY: "장소 접근성 정보",
  BUILDING_ACCESSIBILITY: "건물 접근성 정보",
  PLACE_REVIEW: "장소 내부 리뷰",
  TOILET_REVIEW: "장애인 화장실 리뷰",
}

const reasonLabels: Record<string, string> = {
  INACCURATE_INFO: "틀린 정보가 있어요",
  CLOSED: "폐점된 곳이에요",
  BAD_USER: "이 정복자를 차단할래요",
  NONE: "알 수 없음",
}

export default function AccessibilityReportDetail({ reportId, visible, close }: Props) {
  const { data: detail, isLoading } = useAccessibilityReportDetail(reportId)
  const { mutateAsync: resolveReport, isPending } = useResolveAccessibilityReport()
  const [isEditing, setIsEditing] = useState(false)

  const placeForm = useForm<EditPlaceAccessibilityFormValues>()
  const buildingForm = useForm<EditBuildingAccessibilityFormValues>()

  const convertToFloorOptions = (floors?: number[]) => {
    if (!floors || floors.length === 0) return undefined
    if (floors.length === 2 && floors.includes(1) && floors.includes(2))
      return floorOptions.find((v) => v.value === "multiple_including_first")
    if (floors.length === 1 && floors[0] === 1) return floorOptions.find((v) => v.value === "first")
    return floorOptions.find((v) => v.value === "not_first")
  }

  useEffect(() => {
    if (!detail) return
    const pa = detail.placeAccessibility
    if (pa) {
      placeForm.reset({
        isFirstFloor: booleanOptions.find((v) => v.value === pa.isFirstFloor),
        floors: convertToFloorOptions(pa.floors),
        floorNumber:
          convertToFloorOptions(pa.floors)?.value === "not_first" ? pa.floors?.[0] : undefined,
        isStairOnlyOption: booleanOptions.find((v) => v.value === pa.isStairOnlyOption),
        stairInfo: stairInfoOptions.find((v) => v.value === pa.stairInfo),
        stairHeightLevel: stairHeightLevelOptions.find((v) => v.value === pa.stairHeightLevel),
        hasSlope: booleanOptions.find((v) => v.value === pa.hasSlope),
        entranceDoorTypes: entranceDoorTypeOptions.filter((v) => pa.entranceDoorTypes?.includes(v.value)),
      })
    }
    const ba = detail.buildingAccessibility
    if (ba) {
      buildingForm.reset({
        hasElevator: booleanOptions.find((v) => v.value === ba.hasElevator),
        hasSlope: booleanOptions.find((v) => v.value === ba.hasSlope),
        entranceStairInfo: stairInfoOptions.find((v) => v.value === ba.entranceStairInfo),
        entranceStairHeightLevel: stairHeightLevelOptions.find((v) => v.value === ba.entranceStairHeightLevel),
        entranceDoorTypes: entranceDoorTypeOptions.filter((v) => ba.entranceDoorTypes?.includes(v.value)),
        elevatorStairInfo: stairInfoOptions.find((v) => v.value === ba.elevatorStairInfo),
        elevatorStairHeightLevel: stairHeightLevelOptions.find((v) => v.value === ba.elevatorStairHeightLevel),
      })
    }
  }, [detail])

  const buildPlacePayload = (formValues: EditPlaceAccessibilityFormValues): AdminUpdatePlaceAccessibilityRequestDTO => {
    let isFirstFloor: boolean
    if (formValues.floors !== undefined) {
      isFirstFloor = formValues.floors.value === "first"
    } else {
      isFirstFloor = formValues.isFirstFloor?.value ?? false
    }

    let floors: number[] | undefined
    if (formValues.floors === undefined) {
      floors = undefined
    } else if (formValues.floors.value === "first") {
      floors = [1]
    } else if (formValues.floors.value === "multiple_including_first") {
      floors = [1, 2]
    } else {
      floors = formValues.floorNumber ? [formValues.floorNumber] : undefined
    }

    const entranceDoorTypes =
      formValues.entranceDoorTypes?.map((v) => v.value).filter(Boolean) ?? undefined

    return {
      isFirstFloor: isFirstFloor || false,
      floors,
      isStairOnlyOption: formValues.isStairOnlyOption?.value,
      stairInfo: formValues.stairInfo?.value || "UNDEFINED",
      stairHeightLevel: formValues.stairHeightLevel?.value,
      hasSlope: formValues.hasSlope?.value || false,
      entranceDoorTypes: entranceDoorTypes?.length ? entranceDoorTypes : undefined,
    }
  }

  const buildBuildingPayload = (formValues: EditBuildingAccessibilityFormValues): AdminUpdateBuildingAccessibilityRequestDTO => {
    const entranceDoorTypes =
      formValues.entranceDoorTypes?.map((v) => v?.value).filter(Boolean) ?? undefined

    return {
      hasElevator: formValues.hasElevator?.value || false,
      hasSlope: formValues.hasSlope?.value || false,
      entranceStairInfo: formValues.entranceStairInfo?.value || "UNDEFINED",
      entranceStairHeightLevel: formValues.entranceStairHeightLevel?.value,
      entranceDoorTypes: entranceDoorTypes?.length ? entranceDoorTypes : undefined,
      elevatorStairInfo: formValues.elevatorStairInfo?.value || "UNDEFINED",
      elevatorStairHeightLevel: formValues.elevatorStairHeightLevel?.value,
    }
  }

  const handleResolveWithUpdate = async () => {
    if (!detail) return
    if (!confirm("접근성 정보를 수정하고 처리 완료합니다. 신고자에게 푸시 알림이 발송됩니다.")) return

    try {
      const request: AdminResolveAccessibilityReportRequestDTO = {
        action: AdminResolveAccessibilityReportRequestDTOActionEnum.Resolve,
      }

      if (detail.targetType === "PLACE_ACCESSIBILITY" && detail.placeAccessibility) {
        request.placeAccessibilityUpdate = buildPlacePayload(placeForm.getValues())
      }
      if (detail.targetType === "BUILDING_ACCESSIBILITY" && detail.buildingAccessibility) {
        request.buildingAccessibilityUpdate = buildBuildingPayload(buildingForm.getValues())
      }

      await resolveReport({ id: reportId, request })
      toast.success("접근성 정보가 수정되고 신고가 처리 완료되었습니다.")
      close()
    } catch {
      toast.error("처리에 실패했습니다.")
    }
  }

  const handleResolve = async () => {
    if (!confirm("수정 없이 처리 완료합니다. 신고자에게 푸시 알림이 발송됩니다.")) return
    try {
      await resolveReport({
        id: reportId,
        request: { action: AdminResolveAccessibilityReportRequestDTOActionEnum.Resolve },
      })
      toast.success("신고가 처리 완료되었습니다.")
      close()
    } catch {
      toast.error("처리에 실패했습니다.")
    }
  }

  const handleDismiss = async () => {
    if (!confirm("이 신고를 무시합니다. 푸시 알림이 발송되지 않습니다.")) return
    try {
      await resolveReport({
        id: reportId,
        request: { action: AdminResolveAccessibilityReportRequestDTOActionEnum.Dismiss },
      })
      toast.success("신고가 무시 처리되었습니다.")
      close()
    } catch {
      toast.error("처리에 실패했습니다.")
    }
  }

  const isResolved = !!detail?.resolvedStatus
  const showPlaceForm = detail?.targetType === "PLACE_ACCESSIBILITY" && detail.placeAccessibility
  const showBuildingForm = detail?.targetType === "BUILDING_ACCESSIBILITY" && detail.buildingAccessibility

  return (
    <RightSheet title="접근성 신고 상세" visible={visible} close={close} style={{ width: 560 }}>
      {isLoading ? (
        <div className="p-6 text-center">로딩 중...</div>
      ) : !detail ? (
        <div className="p-6 text-center">신고를 찾을 수 없습니다.</div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Report Info */}
          <section className="space-y-3">
            <h3 className="font-semibold text-base">신고 정보</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">장소명</div>
              <div>{detail.placeName ?? "-"}</div>
              <div className="text-muted-foreground">주소</div>
              <div>{detail.placeAddress ?? "-"}</div>
              <div className="text-muted-foreground">신고 유형</div>
              <div>{targetTypeLabels[detail.targetType] ?? detail.targetType}</div>
              <div className="text-muted-foreground">신고 사유</div>
              <div>{reasonLabels[detail.reason] ?? detail.reason}</div>
              <div className="text-muted-foreground">상세 내용</div>
              <div>{detail.detail ?? "상세 내용 없음"}</div>
              <div className="text-muted-foreground">신고자</div>
              <div>{detail.reporterNickname ?? "익명"}</div>
              <div className="text-muted-foreground">신고일시</div>
              <div>{format(new Date(detail.createdAt), "yyyy.MM.dd HH:mm")}</div>
              {isResolved && (
                <>
                  <div className="text-muted-foreground">처리 상태</div>
                  <div>
                    {detail.resolvedStatus === "RESOLVED" ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">처리완료</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">무시</span>
                    )}
                  </div>
                  <div className="text-muted-foreground">처리일시</div>
                  <div>{detail.resolvedAt ? format(new Date(detail.resolvedAt), "yyyy.MM.dd HH:mm") : "-"}</div>
                </>
              )}
            </div>
          </section>

          {/* Accessibility Edit Forms */}
          {showPlaceForm && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">장소 접근성 정보</h3>
                {!isResolved && (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "수정 취소" : "수정"}
                  </Button>
                )}
              </div>
              {isEditing && !isResolved ? (
                <FormProvider {...placeForm}>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Combobox name="floors" label="층 정보" options={floorOptions} />
                      <Combobox
                        name="isFirstFloor"
                        label="1층에 있는 장소"
                        options={booleanOptions}
                        isDisabled={placeForm.watch("floors") != undefined}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberInput
                        name="floorNumber"
                        label="몇 층?"
                        disabled={!placeForm.watch("floors") || placeForm.watch("floors")?.value !== "not_first"}
                      />
                      <Combobox
                        name="isStairOnlyOption"
                        label="계단만 있나요?"
                        options={booleanOptions}
                        isDisabled={!placeForm.watch("floors") || placeForm.watch("floors")?.value !== "multiple_including_first"}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Combobox name="stairInfo" label="입구 계단 정보" options={stairInfoOptions} />
                      <Combobox
                        name="stairHeightLevel"
                        label="계단 높이"
                        options={stairHeightLevelOptions}
                        isDisabled={!placeForm.watch("stairInfo") || placeForm.watch("stairInfo")?.value !== "ONE"}
                      />
                    </div>
                    <Combobox name="hasSlope" label="경사로 유무" options={booleanOptions} />
                    <Combobox isMulti name="entranceDoorTypes" label="출입문 유형" options={entranceDoorTypeOptions} />
                  </div>
                </FormProvider>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">1층 여부</div>
                  <div>{detail.placeAccessibility?.isFirstFloor ? "예" : "아니오"}</div>
                  <div className="text-muted-foreground">계단 정보</div>
                  <div>{detail.placeAccessibility?.stairInfo ?? "-"}</div>
                  <div className="text-muted-foreground">경사로</div>
                  <div>{detail.placeAccessibility?.hasSlope ? "있음" : "없음"}</div>
                  <div className="text-muted-foreground">출입문</div>
                  <div>{detail.placeAccessibility?.entranceDoorTypes?.join(", ") ?? "-"}</div>
                </div>
              )}
            </section>
          )}

          {showBuildingForm && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">건물 접근성 정보</h3>
                {!isResolved && (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "수정 취소" : "수정"}
                  </Button>
                )}
              </div>
              {isEditing && !isResolved ? (
                <FormProvider {...buildingForm}>
                  <div className="space-y-3">
                    <Combobox name="hasSlope" label="경사로 유무" options={booleanOptions} />
                    <div className="grid grid-cols-2 gap-3">
                      <Combobox name="entranceStairInfo" label="입구 계단" options={stairInfoOptions} />
                      <Combobox
                        name="entranceStairHeightLevel"
                        label="입구 계단 높이"
                        options={stairHeightLevelOptions}
                        isDisabled={!buildingForm.watch("entranceStairInfo") || buildingForm.watch("entranceStairInfo")?.value !== "ONE"}
                      />
                    </div>
                    <Combobox isMulti name="entranceDoorTypes" label="출입문 유형" options={entranceDoorTypeOptions} />
                    <Combobox name="hasElevator" label="엘리베이터 유무" options={booleanOptions} />
                    <div className="grid grid-cols-2 gap-3">
                      <Combobox
                        name="elevatorStairInfo"
                        label="엘리베이터까지 계단"
                        options={stairInfoOptions}
                        isDisabled={!buildingForm.watch("hasElevator") || buildingForm.watch("hasElevator")?.value === false}
                      />
                      <Combobox
                        name="elevatorStairHeightLevel"
                        label="엘리베이터 계단 높이"
                        options={stairHeightLevelOptions}
                        isDisabled={!buildingForm.watch("elevatorStairInfo") || buildingForm.watch("elevatorStairInfo")?.value !== "ONE"}
                      />
                    </div>
                  </div>
                </FormProvider>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">엘리베이터</div>
                  <div>{detail.buildingAccessibility?.hasElevator ? "있음" : "없음"}</div>
                  <div className="text-muted-foreground">경사로</div>
                  <div>{detail.buildingAccessibility?.hasSlope ? "있음" : "없음"}</div>
                  <div className="text-muted-foreground">입구 계단</div>
                  <div>{detail.buildingAccessibility?.entranceStairInfo ?? "-"}</div>
                  <div className="text-muted-foreground">출입문</div>
                  <div>{detail.buildingAccessibility?.entranceDoorTypes?.join(", ") ?? "-"}</div>
                </div>
              )}
            </section>
          )}

          {/* Review targets (read-only) */}
          {(detail.targetType === "PLACE_REVIEW" || detail.targetType === "TOILET_REVIEW") && (
            <section className="space-y-3">
              <h3 className="font-semibold text-base">리뷰 정보</h3>
              <p className="text-sm text-muted-foreground">
                리뷰 내용은 어드민에서 수정할 수 없습니다.
              </p>
            </section>
          )}

          {/* Action Buttons */}
          {!isResolved && (
            <section className="space-y-2 pt-4 border-t">
              {isEditing && (showPlaceForm || showBuildingForm) && (
                <Button className="w-full" onClick={handleResolveWithUpdate} disabled={isPending}>
                  수정 & 처리 완료
                </Button>
              )}
              <Button className="w-full" variant="outline" onClick={handleResolve} disabled={isPending}>
                처리 완료 (수정 없이)
              </Button>
              <Button className="w-full" variant="ghost" onClick={handleDismiss} disabled={isPending}>
                무시
              </Button>
            </section>
          )}
        </div>
      )}
    </RightSheet>
  )
}
