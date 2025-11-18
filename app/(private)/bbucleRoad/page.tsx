"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { useBbucleRoadPages } from "@/lib/apis/bbucleRoad"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents, Header } from "@/components/layout"
import { DataTable } from "@/components/ui/data-table"

import { getColumns } from "./components/columns"

export default function BbucleRoadList() {
  const router = useRouter()
  const { data: pages, isLoading } = useBbucleRoadPages()

  const columns = getColumns()

  return (
    <>
      <Header title="뿌클로드 관리">
        <Header.ActionButton onClick={() => router.push("/bbucleRoad/create")}>
          <Plus className="h-4 w-4 mr-2" />
          새 페이지 추가
        </Header.ActionButton>
      </Header>
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
