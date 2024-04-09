"use client"

import { TextInput } from "@reactleaf/input/hookform"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import { AccessibilitySummary } from "@/lib/models/accessibility"

import Table, { makeTypedColumn } from "@/components/Table"
import { Contents, Header } from "@/components/layout"
import { Flex } from "@/styles/jsx"

import { ActionsCell, ImagesCell } from "./components/Cells"
import * as S from "./page.style"
import { useAccessibilities } from "./query"

export default function AccessibilityList() {
  const queryClient = useQueryClient()
  const form = useForm<{ query: string }>()
  const [query, setQuery] = useState<string>("")
  const { data, fetchNextPage, hasNextPage } = useAccessibilities(query)
  const accessibilities = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <>
      <Header title="등록된 정보 관리" />
      <Contents.Normal>
        <FormProvider {...form}>
          <Flex>
            <TextInput type="text" name="query" placeholder="등록 최신순 검색" />
            <S.SearchButton style={{ width: 80 }} onClick={() => setQuery(form.watch("query"))}>
              검색
            </S.SearchButton>
          </Flex>
        </FormProvider>
        <Table
          rows={accessibilities}
          rowKey={(row) => row.placeAccessibility.id}
          columns={columns}
          context={{ query }}
        />
        {hasNextPage && <S.LoadNextPageButton onClick={() => fetchNextPage()}>더 불러오기</S.LoadNextPageButton>}
      </Contents.Normal>
    </>
  )
}

const col = makeTypedColumn<AccessibilitySummary, { query: string }>()
const columns = [
  col({
    title: "장소 사진",
    field: "placeAccessibility",
    render: (placeAccessibility) => <ImagesCell images={placeAccessibility.imageUrls} />,
  }),
  col({
    title: "건물 사진",
    field: "buildingAccessibility",
    render: (buildingAccessibility) => <ImagesCell images={buildingAccessibility?.imageUrls ?? []} />,
  }),
  col({
    title: "촬영 정보",
    field: "placeAccessibility",
    render: (placeAccessibility) => (
      <p>
        장소 : {placeAccessibility.placeName}
        <br />
        촬영 : {placeAccessibility.registeredUserName}
        <br />
        시각 : {dayjs(placeAccessibility.createdAtMillis).format("YYYY-MM-DD HH:mm")}
      </p>
    ),
  }),
  col({ field: "_", render: (_, row, ctx) => <ActionsCell accessibility={row} query={ctx?.query} /> }),
]
