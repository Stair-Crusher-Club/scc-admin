"use client"

import { useRouter } from "next/navigation"

import { usePlaceSpecialAccessibilities } from "@/lib/apis/placeSpecialAccessibility"
import { AdminPlaceSpecialAccessibilityDto } from "@/lib/generated-sources/openapi"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { PageActions } from "@/components/page-actions"
import { DataTable } from "@/components/ui/data-table"

import { getColumns } from "./components/columns"

export default function PlaceSpecialAccessibilityList() {
  const router = useRouter()
  const { data, isLoading } = usePlaceSpecialAccessibilities()

  const columns = getColumns()

  const handleRowClick = (row: AdminPlaceSpecialAccessibilityDto) => {
    router.push(`/place-special-accessibility/${row.id}`)
  }

  return (
    <Contents.Normal>
      <PageActions>
        <Button onClick={() => router.push("/place-special-accessibility/create")} size="sm">
          추가
        </Button>
      </PageActions>
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <DataTable columns={columns} data={data ?? []} onRowClick={handleRowClick} />
          )}
        </CardContent>
      </Card>
    </Contents.Normal>
  )
}
