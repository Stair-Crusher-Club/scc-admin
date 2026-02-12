"use client"

import { useRouter } from "next/navigation"

import { usePlaceLists } from "@/lib/apis/placeList"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { PageActions } from "@/components/page-actions"
import { DataTable } from "@/components/ui/data-table"

import { getColumns } from "./components/columns"

export default function PlaceListPage() {
  const router = useRouter()
  const { data: placeLists, isLoading } = usePlaceLists()

  const columns = getColumns()

  return (
    <Contents.Normal>
      <PageActions>
        <Button onClick={() => router.push("/placeList/create")} size="sm">
          새 리스트 추가
        </Button>
      </PageActions>
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <DataTable columns={columns} data={placeLists ?? []} />
          )}
        </CardContent>
      </Card>
    </Contents.Normal>
  )
}
