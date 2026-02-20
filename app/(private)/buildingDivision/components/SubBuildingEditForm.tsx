import { useState } from "react"
import { toast } from "react-toastify"

import { AdminSubBuildingDTO, LocationDTO } from "@/lib/generated-sources/openapi"
import NaverMapBoundaryEditor, { BoundaryData } from "@/components/NaverMapBoundaryEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useUpdateSubBuilding } from "../query"

interface SubBuildingEditFormProps {
  divisionId: string
  subBuilding: AdminSubBuildingDTO
  buildingLocation: LocationDTO
  onClose: () => void
}

export default function SubBuildingEditForm({
  divisionId,
  subBuilding,
  buildingLocation,
  onClose
}: SubBuildingEditFormProps) {
  const updateMutation = useUpdateSubBuilding(divisionId, subBuilding.id)
  const [formData, setFormData] = useState({
    subBuildingName: subBuilding.subBuildingName,
    notes: subBuilding.notes || "",
  })
  const [boundaryData, setBoundaryData] = useState<BoundaryData | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!boundaryData) {
      toast.error("지도에서 경계를 그려주세요.")
      return
    }

    try {
      await updateMutation.mutateAsync({
        subBuildingName: formData.subBuildingName,
        centerLng: boundaryData.center.lng,
        centerLat: boundaryData.center.lat,
        boundaryWkt: boundaryData.wkt,
        notes: formData.notes || undefined,
      })
      toast.success("SubBuilding이 수정되었습니다.")
      onClose()
    } catch (error) {
      toast.error("SubBuilding 수정에 실패했습니다.")
      console.error(error)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 bg-amber-50 rounded-md border border-amber-200 mb-4"
    >
      <h3 className="text-base font-semibold mb-4">SubBuilding 수정</h3>

      <div className="mb-4">
        <Label htmlFor="edit-subBuildingName" className="mb-1.5">
          서브 건물 이름 *
        </Label>
        <Input
          id="edit-subBuildingName"
          type="text"
          value={formData.subBuildingName}
          onChange={(e) => setFormData({ ...formData, subBuildingName: e.target.value })}
          placeholder="예: 연세대학교 신촌캠퍼스 백양관"
          required
        />
      </div>

      <div className="mb-4">
        <Label className="mb-1.5">경계 설정 *</Label>
        <NaverMapBoundaryEditor
          initialCenter={subBuilding.centerLocation}
          initialBoundary={subBuilding.boundaryWkt}
          buildingMarkerLocation={buildingLocation}
          onBoundaryChange={setBoundaryData}
          height="400px"
        />
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
        <Label htmlFor="edit-notes" className="mb-1.5">
          메모
        </Label>
        <Textarea
          id="edit-notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="추가 정보 입력"
          className="resize-y font-mono"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={updateMutation.isPending || !boundaryData}>
          수정
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
      </div>
    </form>
  )
}
