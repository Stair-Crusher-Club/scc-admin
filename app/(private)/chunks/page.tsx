"use client"

import { useRouter } from "next/navigation"

import { Contents } from "@/components/layout"
import { PageActions } from "@/components/page-actions"
import { Button } from "@/components/ui/button"

export default function ChunksPage() {
  const router = useRouter()

  return (
    <Contents.Normal>
      <PageActions>
        <Button onClick={() => router.push("/chunks/crawl")} size="sm">
          새 청크 불러오기
        </Button>
      </PageActions>
      <p className="text-muted-foreground">장소 청크를 관리합니다. 새 청크를 불러오려면 위 버튼을 클릭하세요.</p>
    </Contents.Normal>
  )
}
