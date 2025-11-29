import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { BbucleRoadPageDTO } from "@/lib/generated-sources/openapi"
import { useDeleteBbucleRoadPage } from "@/lib/apis/bbucleRoad"

import { Button } from "@/components/ui/button"

export function ActionsCell({ page }: { page: BbucleRoadPageDTO }) {
  const router = useRouter()
  const { mutateAsync: deletePage } = useDeleteBbucleRoadPage()

  const handleDelete = async () => {
    if (!confirm(`정말 "${page.title}" 페이지를 삭제하시겠습니까?`)) {
      return
    }
    await deletePage(page.id)
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="sm" variant="outline" className="gap-2" onClick={() => router.push(`/bbucleRoad/${page.id}`)}>
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
