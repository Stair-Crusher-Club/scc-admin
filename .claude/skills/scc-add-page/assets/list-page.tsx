"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { type ColumnFiltersState } from "@tanstack/react-table"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Contents } from "@/components/layout/Contents"
import { TextInput } from "@reactleaf/input"
// TODO: Import your query hook
// import { useFeatureList } from "./query"

// TODO: Define your search payload type
interface SearchPayload {
  query?: string
  // Add other search fields
}

// TODO: Define your data type
interface FeatureItem {
  id: string
  name: string
  // Add other fields
}

export default function FeatureList() {
  const form = useForm<SearchPayload>()
  const [formInput, setFormInput] = useState<SearchPayload>()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // TODO: Replace with your actual query hook
  // const { data, fetchNextPage, hasNextPage, isLoading } = useFeatureList(formInput)
  const data = { pages: [] }
  const hasNextPage = false
  const fetchNextPage = () => {}

  // TODO: Define your table columns
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    // Add more columns
  ]

  function handleSearch(values: SearchPayload) {
    setFormInput(values)
  }

  return (
    <Contents.Normal>
      {/* Search/Filter Card */}
      <Card className="p-6">
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextInput
              {...form.register("query")}
              label="Search"
              placeholder="Enter search query"
            />
            {/* TODO: Add more filter inputs */}
          </div>
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {/* Data Table Card */}
      <Card className="p-6">
        <DataTable
          columns={columns}
          data={data?.pages.flatMap((p: any) => p.items) ?? []}
          onLoadMore={() => fetchNextPage()}
          hasMore={hasNextPage}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          // Optional: Add expandable rows
          // renderExpandedRow={(row) => <DetailComponent data={row} />}
        />
      </Card>
    </Contents.Normal>
  )
}
