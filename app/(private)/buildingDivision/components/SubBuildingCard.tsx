import dayjs from "dayjs"

import { AdminSubBuildingDTO } from "@/lib/generated-sources/openapi"
import { Button } from "@/components/ui/button"

interface SubBuildingCardProps {
  subBuilding: AdminSubBuildingDTO
  isPending: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function SubBuildingCard({
  subBuilding,
  isPending,
  onEdit,
  onDelete,
}: SubBuildingCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-semibold">{subBuilding.subBuildingName}</h3>
        {isPending && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              수정
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              삭제
            </Button>
          </div>
        )}
      </div>
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
