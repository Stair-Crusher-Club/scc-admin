"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import dayjs from "dayjs"

import { Contents } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  useBuildingDivision,
  useConfirmBuildingDivision,
  useIgnoreBuildingDivision,
  useDeleteSubBuilding,
  useAssignPlacesToSubBuildings,
} from "../query"
import SubBuildingCard from "../components/SubBuildingCard"
import SubBuildingForm from "../components/SubBuildingForm"
import SubBuildingEditForm from "../components/SubBuildingEditForm"
import SubBuildingsMapView from "../components/SubBuildingsMapView"

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
  const deleteMutation = useDeleteSubBuilding(divisionId)
  const [isAddingSubBuilding, setIsAddingSubBuilding] = useState(false)
  const [editingSubBuildingId, setEditingSubBuildingId] = useState<string | null>(null)

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

  const handleDeleteSubBuilding = async (subBuildingId: string) => {
    if (!confirm("이 SubBuilding을 삭제하시겠습니까?")) {
      return
    }

    try {
      await deleteMutation.mutateAsync(subBuildingId)
      toast.success("SubBuilding이 삭제되었습니다.")
    } catch (error) {
      toast.error("SubBuilding 삭제에 실패했습니다.")
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
              buildingLocation={division.buildingLocation}
              onClose={() => setIsAddingSubBuilding(false)}
            />
          )}

          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="map">지도 보기</TabsTrigger>
              <TabsTrigger value="list">목록 보기</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-4">
              <SubBuildingsMapView
                subBuildings={subBuildings}
                buildingLocation={division.buildingLocation}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-4">
              {subBuildings.length === 0 ? (
                <p className="p-8 text-center text-gray-500">
                  SubBuilding이 없습니다. 추가 버튼을 눌러 생성하세요.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {subBuildings.map((subBuilding) => (
                    editingSubBuildingId === subBuilding.id ? (
                      <SubBuildingEditForm
                        key={subBuilding.id}
                        divisionId={divisionId}
                        subBuilding={subBuilding}
                        buildingLocation={division.buildingLocation}
                        onClose={() => setEditingSubBuildingId(null)}
                      />
                    ) : (
                      <SubBuildingCard
                        key={subBuilding.id}
                        subBuilding={subBuilding}
                        isPending={isPending}
                        onEdit={() => setEditingSubBuildingId(subBuilding.id)}
                        onDelete={() => handleDeleteSubBuilding(subBuilding.id)}
                      />
                    )
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
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

