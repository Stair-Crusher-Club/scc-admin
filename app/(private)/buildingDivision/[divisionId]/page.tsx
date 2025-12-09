"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import dayjs from "dayjs"

import { AdminSubBuildingDTO } from "@/lib/generated-sources/openapi"
import { Contents } from "@/components/layout"
import NaverMapBoundaryEditor, { BoundaryData } from "@/components/NaverMapBoundaryEditor"

import {
  useBuildingDivision,
  useConfirmBuildingDivision,
  useIgnoreBuildingDivision,
  useCreateSubBuilding,
  useAssignPlacesToSubBuildings,
} from "../query"
import * as S from "./page.style"

interface PageProps {
  params: {
    divisionId: string
  }
}

export default function BuildingDivisionDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { divisionId } = params
  const { data, isLoading } = useBuildingDivision(divisionId)
  const confirmMutation = useConfirmBuildingDivision()
  const ignoreMutation = useIgnoreBuildingDivision()
  const assignPlacesMutation = useAssignPlacesToSubBuildings(divisionId)
  const [isAddingSubBuilding, setIsAddingSubBuilding] = useState(false)

  if (isLoading || !data) {
    return (
      <Contents.Normal>
        <S.LoadingMessage>로딩 중...</S.LoadingMessage>
      </Contents.Normal>
    )
  }

  const { division, subBuildings } = data

  const handleConfirm = async () => {
    if (!confirm("Building Division을 확정하시겠습니까?\n확정 후에는 Place들이 SubBuilding에 할당됩니다.")) {
      return
    }

    try {
      await confirmMutation.mutateAsync(divisionId)
      toast.success("Building Division이 확정되었습니다.")
    } catch (error) {
      toast.error("확정에 실패했습니다.")
      console.error(error)
    }
  }

  const handleIgnore = async () => {
    if (!confirm("Building Division을 무시하시겠습니까?")) {
      return
    }

    try {
      await ignoreMutation.mutateAsync(divisionId)
      toast.success("Building Division이 무시되었습니다.")
      router.push("/buildingDivision")
    } catch (error) {
      toast.error("무시 처리에 실패했습니다.")
      console.error(error)
    }
  }

  const handleAssignPlaces = async () => {
    if (!confirm("Place들을 SubBuilding에 할당하시겠습니까?\n위치 기반으로 자동 할당됩니다.")) {
      return
    }

    try {
      await assignPlacesMutation.mutateAsync()
      toast.success("Place 할당이 완료되었습니다.")
    } catch (error) {
      toast.error("Place 할당에 실패했습니다.")
      console.error(error)
    }
  }

  const isPending = division.status === "PENDING"

  return (
    <Contents.Normal>
      <S.BackButton onClick={() => router.back()}>← 목록으로</S.BackButton>

      <S.Header>
        <S.TitleRow>
          <S.Title>Building Division 상세</S.Title>
          <S.StatusBadge status={division.status}>{getStatusLabel(division.status)}</S.StatusBadge>
        </S.TitleRow>
      </S.Header>

      <S.InfoSection>
        <S.InfoRow>
          <S.InfoLabel>Building ID</S.InfoLabel>
          <S.InfoValue>{division.buildingId}</S.InfoValue>
        </S.InfoRow>
        <S.InfoRow>
          <S.InfoLabel>도로명 주소</S.InfoLabel>
          <S.InfoValue>{division.roadAddress}</S.InfoValue>
        </S.InfoRow>
        {division.divisionReason && (
          <S.InfoRow>
            <S.InfoLabel>분할 사유</S.InfoLabel>
            <S.InfoValue>{division.divisionReason}</S.InfoValue>
          </S.InfoRow>
        )}
        <S.InfoRow>
          <S.InfoLabel>생성일</S.InfoLabel>
          <S.InfoValue>{dayjs(division.createdAt?.value).format("YYYY-MM-DD HH:mm")}</S.InfoValue>
        </S.InfoRow>
        {division.confirmedAt && (
          <S.InfoRow>
            <S.InfoLabel>확정일</S.InfoLabel>
            <S.InfoValue>{dayjs(division.confirmedAt.value).format("YYYY-MM-DD HH:mm")}</S.InfoValue>
          </S.InfoRow>
        )}
        {division.ignoredAt && (
          <S.InfoRow>
            <S.InfoLabel>무시일</S.InfoLabel>
            <S.InfoValue>{dayjs(division.ignoredAt.value).format("YYYY-MM-DD HH:mm")}</S.InfoValue>
          </S.InfoRow>
        )}
      </S.InfoSection>

      {isPending && (
        <S.ActionSection>
          <S.ActionButton variant="primary" onClick={handleConfirm} disabled={confirmMutation.isPending}>
            확정하기
          </S.ActionButton>
          <S.ActionButton variant="secondary" onClick={handleIgnore} disabled={ignoreMutation.isPending}>
            무시하기
          </S.ActionButton>
          <S.ActionButton variant="secondary" onClick={handleAssignPlaces} disabled={assignPlacesMutation.isPending}>
            Place 자동 할당
          </S.ActionButton>
        </S.ActionSection>
      )}

      <S.SubBuildingsSection>
        <S.SubBuildingsHeader>
          <S.SubBuildingsTitle>SubBuildings ({subBuildings.length}개)</S.SubBuildingsTitle>
          {isPending && (
            <S.AddButton onClick={() => setIsAddingSubBuilding(true)}>+ SubBuilding 추가</S.AddButton>
          )}
        </S.SubBuildingsHeader>

        {isAddingSubBuilding && (
          <SubBuildingForm
            divisionId={divisionId}
            onClose={() => setIsAddingSubBuilding(false)}
          />
        )}

        {subBuildings.length === 0 ? (
          <S.EmptyMessage>SubBuilding이 없습니다. 추가 버튼을 눌러 생성하세요.</S.EmptyMessage>
        ) : (
          <S.SubBuildingsList>
            {subBuildings.map((subBuilding) => (
              <SubBuildingCard key={subBuilding.id} subBuilding={subBuilding} />
            ))}
          </S.SubBuildingsList>
        )}
      </S.SubBuildingsSection>
    </Contents.Normal>
  )
}

function SubBuildingCard({ subBuilding }: { subBuilding: any }) {
  return (
    <S.SubBuildingCard>
      <S.SubBuildingName>{subBuilding.subBuildingName}</S.SubBuildingName>
      <S.SubBuildingInfo>
        <S.SubBuildingInfoRow>
          <S.SubBuildingInfoLabel>중심 위치</S.SubBuildingInfoLabel>
          <S.SubBuildingInfoValue>
            {subBuilding.centerLocation.lat.toFixed(6)}, {subBuilding.centerLocation.lng.toFixed(6)}
          </S.SubBuildingInfoValue>
        </S.SubBuildingInfoRow>
        <S.SubBuildingInfoRow>
          <S.SubBuildingInfoLabel>경계 (WKT)</S.SubBuildingInfoLabel>
          <S.SubBuildingInfoValue>{subBuilding.boundaryWkt}</S.SubBuildingInfoValue>
        </S.SubBuildingInfoRow>
        {subBuilding.notes && (
          <S.SubBuildingInfoRow>
            <S.SubBuildingInfoLabel>메모</S.SubBuildingInfoLabel>
            <S.SubBuildingInfoValue>{subBuilding.notes}</S.SubBuildingInfoValue>
          </S.SubBuildingInfoRow>
        )}
        <S.SubBuildingInfoRow>
          <S.SubBuildingInfoLabel>생성일</S.SubBuildingInfoLabel>
          <S.SubBuildingInfoValue>
            {dayjs(subBuilding.createdAt?.value).format("YYYY-MM-DD HH:mm")}
          </S.SubBuildingInfoValue>
        </S.SubBuildingInfoRow>
      </S.SubBuildingInfo>
    </S.SubBuildingCard>
  )
}

function SubBuildingForm({ divisionId, onClose }: { divisionId: string; onClose: () => void }) {
  const createMutation = useCreateSubBuilding(divisionId)
  const [formData, setFormData] = useState({
    subBuildingName: "",
    notes: "",
  })
  const [boundaryData, setBoundaryData] = useState<BoundaryData | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!boundaryData) {
      toast.error("지도에서 경계를 그려주세요.")
      return
    }

    try {
      await createMutation.mutateAsync({
        subBuildingName: formData.subBuildingName,
        centerLng: boundaryData.center.lng,
        centerLat: boundaryData.center.lat,
        boundaryWkt: boundaryData.wkt,
        notes: formData.notes || undefined,
      })
      toast.success("SubBuilding이 생성되었습니다.")
      onClose()
    } catch (error) {
      toast.error("SubBuilding 생성에 실패했습니다.")
      console.error(error)
    }
  }

  return (
    <S.FormContainer onSubmit={handleSubmit}>
      <S.FormTitle>SubBuilding 추가</S.FormTitle>
      <S.FormField>
        <S.FormLabel>서브 건물 이름 *</S.FormLabel>
        <S.FormInput
          type="text"
          value={formData.subBuildingName}
          onChange={(e) => setFormData({ ...formData, subBuildingName: e.target.value })}
          placeholder="예: 연세대학교 신촌캠퍼스 백양관"
          required
        />
      </S.FormField>
      <S.FormField>
        <S.FormLabel>경계 설정 *</S.FormLabel>
        <NaverMapBoundaryEditor onBoundaryChange={setBoundaryData} height="400px" />
        {boundaryData && (
          <S.BoundaryPreview>
            <div>
              중심 좌표: {boundaryData.center.lat.toFixed(6)}, {boundaryData.center.lng.toFixed(6)}
            </div>
            <div>점 개수: {boundaryData.points.length}개</div>
          </S.BoundaryPreview>
        )}
      </S.FormField>
      <S.FormField>
        <S.FormLabel>메모</S.FormLabel>
        <S.FormTextarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="추가 정보 입력"
        />
      </S.FormField>
      <S.FormActions>
        <S.FormButton type="submit" disabled={createMutation.isPending || !boundaryData}>
          추가
        </S.FormButton>
        <S.FormButton type="button" onClick={onClose} variant="secondary">
          취소
        </S.FormButton>
      </S.FormActions>
    </S.FormContainer>
  )
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "대기 중",
    CONFIRMED: "확정됨",
    IGNORED: "무시됨",
  }
  return labels[status] || status
}
