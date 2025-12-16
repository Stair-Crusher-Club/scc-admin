"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import dayjs from "dayjs"

import { AdminSubBuildingDTO } from "@/lib/generated-sources/openapi"
import { Contents } from "@/components/layout"
import NaverMapBoundaryEditor, { BoundaryData } from "@/components/NaverMapBoundaryEditor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  useBuildingDivision,
  useConfirmBuildingDivision,
  useIgnoreBuildingDivision,
  useCreateSubBuilding,
  useAssignPlacesToSubBuildings,
} from "../query"

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
        <p className="p-8 text-center text-gray-500">로딩 중...</p>
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        ← 목록으로
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">Building Division 상세</h1>
          <StatusBadge status={division.status} />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <InfoRow label="Building ID" value={division.buildingId} />
          <InfoRow label="도로명 주소" value={division.roadAddress} />
          {division.divisionReason && (
            <InfoRow label="분할 사유" value={division.divisionReason} />
          )}
          <InfoRow
            label="생성일"
            value={dayjs(division.createdAt?.value).format("YYYY-MM-DD HH:mm")}
          />
          {division.confirmedAt && (
            <InfoRow
              label="확정일"
              value={dayjs(division.confirmedAt.value).format("YYYY-MM-DD HH:mm")}
            />
          )}
          {division.ignoredAt && (
            <InfoRow
              label="무시일"
              value={dayjs(division.ignoredAt.value).format("YYYY-MM-DD HH:mm")}
            />
          )}
        </CardContent>
      </Card>

      {isPending && (
        <div className="flex gap-3 mb-6">
          <Button
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
          >
            확정하기
          </Button>
          <Button
            variant="outline"
            onClick={handleIgnore}
            disabled={ignoreMutation.isPending}
          >
            무시하기
          </Button>
          <Button
            variant="outline"
            onClick={handleAssignPlaces}
            disabled={assignPlacesMutation.isPending}
          >
            Place 자동 할당
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">SubBuildings ({subBuildings.length}개)</CardTitle>
            {isPending && (
              <Button size="sm" onClick={() => setIsAddingSubBuilding(true)}>
                + SubBuilding 추가
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isAddingSubBuilding && (
            <SubBuildingForm
              divisionId={divisionId}
              onClose={() => setIsAddingSubBuilding(false)}
            />
          )}

          {subBuildings.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              SubBuilding이 없습니다. 추가 버튼을 눌러 생성하세요.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {subBuildings.map((subBuilding) => (
                <SubBuildingCard key={subBuilding.id} subBuilding={subBuilding} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Contents.Normal>
  )
}

function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { label: "대기 중", variant: "outline" },
      CONFIRMED: { label: "확정됨", variant: "default" },
      IGNORED: { label: "무시됨", variant: "secondary" },
    }
    return configs[status] || { label: status, variant: "outline" }
  }

  const config = getStatusConfig(status)
  return (
    <Badge variant={config.variant} className={
      status === "PENDING" ? "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100" :
      status === "CONFIRMED" ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-100" :
      "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100"
    }>
      {config.label}
    </Badge>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex py-3 border-b border-gray-100 last:border-b-0">
      <div className="w-[150px] text-sm font-semibold text-gray-700">{label}</div>
      <div className="flex-1 text-sm text-gray-900">{value}</div>
    </div>
  )
}

function SubBuildingCard({ subBuilding }: { subBuilding: any }) {
  return (
    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
      <h3 className="text-base font-semibold mb-3">{subBuilding.subBuildingName}</h3>
      <div className="flex flex-col gap-2">
        <SubBuildingInfoRow
          label="중심 위치"
          value={`${subBuilding.centerLocation.lat.toFixed(6)}, ${subBuilding.centerLocation.lng.toFixed(6)}`}
        />
        <SubBuildingInfoRow label="경계 (WKT)" value={subBuilding.boundaryWkt} />
        {subBuilding.notes && (
          <SubBuildingInfoRow label="메모" value={subBuilding.notes} />
        )}
        <SubBuildingInfoRow
          label="생성일"
          value={dayjs(subBuilding.createdAt?.value).format("YYYY-MM-DD HH:mm")}
        />
      </div>
    </div>
  )
}

function SubBuildingInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex text-sm">
      <span className="w-[120px] font-medium text-gray-600">{label}</span>
      <span className="flex-1 text-gray-900 break-all">{value}</span>
    </div>
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
    <form
      onSubmit={handleSubmit}
      className="p-5 bg-blue-50 rounded-md border border-blue-200 mb-4"
    >
      <h3 className="text-base font-semibold mb-4">SubBuilding 추가</h3>

      <div className="mb-4">
        <Label htmlFor="subBuildingName" className="mb-1.5">
          서브 건물 이름 *
        </Label>
        <Input
          id="subBuildingName"
          type="text"
          value={formData.subBuildingName}
          onChange={(e) => setFormData({ ...formData, subBuildingName: e.target.value })}
          placeholder="예: 연세대학교 신촌캠퍼스 백양관"
          required
        />
      </div>

      <div className="mb-4">
        <Label className="mb-1.5">경계 설정 *</Label>
        <NaverMapBoundaryEditor onBoundaryChange={setBoundaryData} height="400px" />
        {boundaryData && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-700 flex flex-col gap-1">
            <div>
              중심 좌표: {boundaryData.center.lat.toFixed(6)}, {boundaryData.center.lng.toFixed(6)}
            </div>
            <div>점 개수: {boundaryData.points.length}개</div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="notes" className="mb-1.5">
          메모
        </Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="추가 정보 입력"
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md min-h-[80px] resize-y font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={createMutation.isPending || !boundaryData}>
          추가
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
      </div>
    </form>
  )
}
