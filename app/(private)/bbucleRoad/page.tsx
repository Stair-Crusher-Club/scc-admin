"use client"

import { useRouter } from "next/navigation"

import { useBbucleRoadPages } from "@/lib/apis/bbucleRoad"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { PageActions } from "@/components/page-actions"
import { DataTable } from "@/components/ui/data-table"

import { getColumns } from "./components/columns"

export default function BbucleRoadList() {
  const router = useRouter()
  const { data: pages, isLoading } = useBbucleRoadPages()

  const columns = getColumns()

  return (
    <Contents.Normal>
      <PageActions>
        <Button onClick={() => router.push("/bbucleRoad/create")} size="sm">
          새 페이지 추가
        </Button>
      </PageActions>
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <DataTable columns={columns} data={pages ?? []} />
          )}
        </CardContent>
      </Card>
    </Contents.Normal>
  )
}
