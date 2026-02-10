import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { AdminPlaceListDto } from "@/lib/generated-sources/openapi"
import { useDeletePlaceList } from "@/lib/apis/placeList"

import { Button } from "@/components/ui/button"

export function ActionsCell({ placeList }: { placeList: AdminPlaceListDto }) {
  const router = useRouter()
  const { mutateAsync: deleteList } = useDeletePlaceList()

  const handleDelete = async () => {
    if (!confirm(`정말 "${placeList.name}" 리스트를 삭제하시겠습니까?`)) {
      return
    }
    await deleteList(placeList.id)
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="sm" variant="outline" className="gap-2" onClick={() => router.push(`/placeList/${placeList.id}`)}>
        <Pencil className="h-3 w-3" />
        편집
      </Button>
      <Button size="sm" variant="destructive" className="gap-2" onClick={handleDelete}>
        <Trash2 className="h-3 w-3" />
        삭제
      </Button>
    </div>
  )
}
