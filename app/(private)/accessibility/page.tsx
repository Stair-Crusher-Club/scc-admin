"use client"

import { DateInput, TextInput } from "@reactleaf/input/hookform"
import { format } from "date-fns"
import dayjs from "dayjs"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import { SearchAccessibilitiesPayload } from "@/lib/apis/api"
import { AccessibilitySummary, BuildingAccessibility } from "@/lib/models/accessibility"

import Table, { makeTypedColumn } from "@/components/Table"
import { Contents, Header } from "@/components/layout"
import { Flex } from "@/styles/jsx"

import { ActionsCell, ImagesCell } from "./components/Cells"
import * as S from "./page.style"
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

  const updateFormInput = (payload: SearchAccessibilitiesPayload) => {
    setFormInput({
      ...payload,
      createdAtFromLocalDate: payload.createdAtFromLocalDate
        ? format(new Date(payload.createdAtFromLocalDate), "yyyy-MM-dd")
        : "",
      createdAtToLocalDate: payload.createdAtToLocalDate
        ? format(new Date(payload.createdAtToLocalDate), "yyyy-MM-dd")
        : "",
    })
  }

  return (
    <>
      <Header title="등록된 정보 관리" />
      <Contents.Normal>
        <FormProvider {...form}>
          <form id="search-accessibilities" onSubmit={form.handleSubmit(updateFormInput)}>
            <Flex>
              <S.InputTitle>장소명</S.InputTitle>
              <TextInput type="text" name="placeName" placeholder="등록 최신순 검색" />
            </Flex>
            <Flex>
              <S.InputTitle>정보 등록 시각</S.InputTitle>
              <DateInput name="createdAtFromLocalDate" label="시작" dateFormat="yyyy-MM-dd" />
              <DateInput name="createdAtToLocalDate" label="끝" dateFormat="yyyy-MM-dd" />
            </Flex>
            <Flex>
              <S.SearchButton
                type="submit"
                form="search-accessibilities"
                style={{ width: 80 }}
                // onClick={() => { console.log(form.watch(), form.watch("createdAtToLocalDate")); setFormInput(form.watch()) }}
              >
                검색
              </S.SearchButton>
            </Flex>
          </form>
        </FormProvider>
        <Table
          rows={accessibilities}
          rowKey={(row) => row.placeAccessibility.id}
          columns={columns}
          context={formInput}
        />
        {hasNextPage && <S.LoadNextPageButton onClick={() => fetchNextPage()}>더 불러오기</S.LoadNextPageButton>}
      </Contents.Normal>
    </>
  )
}

const col = makeTypedColumn<AccessibilitySummary, SearchAccessibilitiesPayload>()
const columns = [
  col({
    title: "장소 사진",
    field: "placeAccessibility",
    render: (placeAccessibility) => (
      <ImagesCell images={placeAccessibility.images.map((item) => item.thumbnailUrl ?? item.imageUrl)} />
    ),
  }),
  col({
    title: "건물 사진",
    field: "buildingAccessibility",
    render: (buildingAccessibility) => <ImagesCell images={mergeBuildingAccessibilityImages(buildingAccessibility)} />,
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
  col({ field: "_", render: (_, row, ctx) => <ActionsCell accessibility={row} ctx={ctx} /> }),
]

const mergeBuildingAccessibilityImages = (buildingAccessibility?: BuildingAccessibility) => {
  const imageUrls: string[] = []
  if (buildingAccessibility == null) return imageUrls

  if (buildingAccessibility.entranceImages.length > 0) {
    buildingAccessibility.entranceImages.forEach((image) => {
      imageUrls.push(image.thumbnailUrl ?? image.imageUrl)
    })
  }
  if (buildingAccessibility.elevatorImages.length > 0) {
    buildingAccessibility.elevatorImages.forEach((image) => {
      imageUrls.push(image.thumbnailUrl ?? image.imageUrl)
    })
  }

  return imageUrls
}
