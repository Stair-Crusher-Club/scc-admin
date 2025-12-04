"use client"

import { format } from "date-fns"
import { Search } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { SearchAccessibilitiesPayload } from "@/lib/apis/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { DataTable } from "@/components/ui/data-table"

import { getColumns } from "./components/columns"
import { useAccessibilities } from "./query"

export default function AccessibilityList() {
  const form = useForm<SearchAccessibilitiesPayload>()
  const [formInput, setFormInput] = useState<SearchAccessibilitiesPayload>({
    placeName: "",
    createdAtFromLocalDate: "",
    createdAtToLocalDate: "",
  })
  const { data, fetchNextPage, hasNextPage } = useAccessibilities(formInput)
  const accessibilities = data?.pages.flatMap((p) => p.items) ?? []

  const updateFormInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const placeName = formData.get("placeName") as string
    const createdAtFrom = formData.get("createdAtFromLocalDate") as string
    const createdAtTo = formData.get("createdAtToLocalDate") as string

    setFormInput({
      placeName: placeName || "",
      createdAtFromLocalDate: createdAtFrom
        ? format(new Date(createdAtFrom), "yyyy-MM-dd")
        : "",
      createdAtToLocalDate: createdAtTo
        ? format(new Date(createdAtTo), "yyyy-MM-dd")
        : "",
    })
  }

  const columns = getColumns(formInput)

  return (
    <>
      <Contents.Normal>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>검색 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="search-accessibilities" onSubmit={updateFormInput}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="placeName">장소명</Label>
                  <Input
                    id="placeName"
                    name="placeName"
                    type="text"
                    placeholder="등록 최신순 검색"
                    defaultValue={formInput.placeName}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="createdAtFromLocalDate">정보 등록 시작일</Label>
                    <Input
                      id="createdAtFromLocalDate"
                      name="createdAtFromLocalDate"
                      type="date"
                      defaultValue={formInput.createdAtFromLocalDate}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="createdAtToLocalDate">정보 등록 종료일</Label>
                    <Input
                      id="createdAtToLocalDate"
                      name="createdAtToLocalDate"
                      type="date"
                      defaultValue={formInput.createdAtToLocalDate}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="gap-2">
                    <Search className="h-4 w-4" />
                    검색
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={accessibilities}
              onLoadMore={() => fetchNextPage()}
              hasMore={hasNextPage}
            />
          </CardContent>
        </Card>
      </Contents.Normal>
    </>
  )
}
