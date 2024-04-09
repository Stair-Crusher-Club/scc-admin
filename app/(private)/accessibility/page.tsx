"use client"

import { TextInput } from "@reactleaf/input"
import dayjs from "dayjs"
import { useState } from "react"

import { searchAccessibilities } from "@/lib/apis/api"
import { AccessibilitySummary } from "@/lib/models/accessibility"

import Table, { makeTypedColumn } from "@/components/Table"
import { Contents, Header } from "@/components/layout"

import { ActionsCell, ImagesCell } from "./components/Cells"
import * as S from "./page.style"

const limit = 10

export default function AccessibilityList() {
  const [query, setQuery] = useState<string>("")
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [accessibilitySummaries, setAccessibilitySummaries] = useState<AccessibilitySummary[]>([])

  const searchAccessibilitiesWithNewQuery = () => {
    searchAccessibilities(query, undefined, limit).then((res) => {
      setAccessibilitySummaries(res.items)
      setCursor(res.cursor)
    })
  }

  const loadNextPage = () => {
    searchAccessibilities(query, cursor, limit).then((res) => {
      setAccessibilitySummaries([...accessibilitySummaries, ...res.items])
      setCursor(res.cursor)
    })
  }

  return (
    <>
      <Header title="등록된 정보 관리" />
      <Contents.Normal>
        <TextInput
          type="text"
          name="query"
          placeholder="등록 최신순 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <S.SearchButton onClick={searchAccessibilitiesWithNewQuery}>검색</S.SearchButton>
        <Table
          rows={accessibilitySummaries}
          rowKey={(row) => row.placeAccessibility.id}
          columns={columns}
          // TODO: reload
          reload={() => void 0}
        />
        {cursor ? (
          <S.LoadNextPageButton onClick={loadNextPage} disabled={!cursor}>
            더 불러오기
          </S.LoadNextPageButton>
        ) : null}
      </Contents.Normal>
    </>
  )
}

const col = makeTypedColumn<AccessibilitySummary>()
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
  col({ field: "_", render: (_, row, ctx) => <ActionsCell accessibility={row} reload={ctx.reload} /> }),
]
