"use client"

import { Copy, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { AdminPlaceListDto } from "@/lib/generated-sources/openapi"
import { useDeletePlaceList } from "@/lib/apis/placeList"

import { Button } from "@/components/ui/button"

export function ActionsCell({ placeList }: { placeList: AdminPlaceListDto }) {
  const router = useRouter()
  const { mutateAsync: deleteList, isPending: isDeleting } = useDeletePlaceList()

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

  const handleCopyDeepLink = async () => {
    const deepLink = `stair-crusher://place-list/${placeList.id}`
    await navigator.clipboard.writeText(deepLink)
    toast.success("딥링크가 복사되었습니다.")
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="sm" variant="outline" className="gap-2" onClick={() => router.push(`/placeList/${placeList.id}`)}>
        <Pencil className="h-3 w-3" />
        편집
      </Button>
      <Button size="sm" variant="outline" className="gap-2" onClick={handleCopyDeepLink}>
        <Copy className="h-3 w-3" />
        딥링크 복사
      </Button>
      <Button size="sm" variant="destructive" className="gap-2" onClick={handleDelete} disabled={isDeleting}>
        <Trash2 className="h-3 w-3" />
        {isDeleting ? "삭제 중..." : "삭제"}
      </Button>
    </div>
  )
}
