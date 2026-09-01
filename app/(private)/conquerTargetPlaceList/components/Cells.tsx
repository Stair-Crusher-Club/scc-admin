"use client"

import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { AdminConquerTargetPlaceDto, AdminConquerTargetPlaceListDto } from "@/lib/generated-sources/openapi"
import {
  useDeleteConquerTargetPlaceList,
  useRemovePlaceFromConquerTargetPlaceList,
} from "@/lib/apis/conquerTargetPlaceList"

import { Button } from "@/components/ui/button"

export function ActionsCell({ placeList }: { placeList: AdminConquerTargetPlaceListDto }) {
  const router = useRouter()
  const { mutateAsync: deleteList, isPending: isDeleting } = useDeleteConquerTargetPlaceList()

  const handleDelete = async () => {
    if (!confirm(`정말 "${placeList.name}" 리스트를 삭제하시겠습니까?`)) {
      return
    }
    try {
      await deleteList(placeList.id)
      toast.success("리스트가 삭제되었습니다.")
    } catch {
      toast.error("리스트 삭제에 실패했습니다.")
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={() => router.push(`/conquerTargetPlaceList/${placeList.id}`)}
      >
        <Pencil className="h-3 w-3" />
        편집
      </Button>
      <Button size="sm" variant="destructive" className="gap-2" onClick={handleDelete} disabled={isDeleting}>
        <Trash2 className="h-3 w-3" />
        {isDeleting ? "삭제 중..." : "삭제"}
      </Button>
    </div>
  )
}

export function PlaceActionsCell({
  placeListId,
  place,
}: {
  placeListId: string
  place: AdminConquerTargetPlaceDto
}) {
  const { mutateAsync: removePlace, isPending: isRemoving } = useRemovePlaceFromConquerTargetPlaceList()

  const handleRemove = async () => {
    if (!confirm(`"${place.name}"을(를) 리스트에서 제거하시겠습니까?`)) {
      return
    }
    try {
      await removePlace({ id: placeListId, placeId: place.placeId })
      toast.success("장소가 제거되었습니다.")
    } catch {
      toast.error("장소 제거에 실패했습니다.")
    }
  }

  return (
    <Button size="sm" variant="destructive" className="gap-2" onClick={handleRemove} disabled={isRemoving}>
      <Trash2 className="h-3 w-3" />
      {isRemoving ? "제거 중..." : "제거"}
    </Button>
  )
}
