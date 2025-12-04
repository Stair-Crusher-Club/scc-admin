"use client"

import { useBbucleRoadPages } from "@/lib/apis/bbucleRoad"

import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { DataTable } from "@/components/ui/data-table"

import { getColumns } from "./components/columns"

export default function BbucleRoadList() {
  const { data: pages, isLoading } = useBbucleRoadPages()

  const columns = getColumns()

  return (
    <>
      <Contents.Normal>
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
    </>
  )
}
