"use client"

import { useQueryClient } from "@tanstack/react-query"
import { format as formatDate } from "date-fns"
import Image from "next/image"
import { useRouter } from "next/navigation"

import H3 from "@/components/Heading/H3"
import Table, { makeTypedColumn } from "@/components/Table"
import { Contents, Header } from "@/components/layout"
import { Button } from "@/components/ui/button"

import * as S from "./page.style"
import { Banner, deleteBanner, useAllBanners, useHomeBanners } from "./query"

export default function BannerList() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const allBanners = useAllBanners()?.data?.banners ?? []
  const homeBanners = useHomeBanners()?.data?.banners ?? []

  const handleDeleteBanner = async (banner: Banner) => {
    if (!confirm(`정말 ${banner.loggingKey} 배너를 삭제하시겠습니까?`)) {
      return
    }
    await deleteBanner(banner)
    await queryClient.invalidateQueries({ queryKey: ["@allBanners"] })
    await queryClient.invalidateQueries({ queryKey: ["@homeBanners"] })
  }

  return (
    <>
      <Header title="등록된 정보 관리" />
      <Contents.Normal>
        <Button onClick={() => router.push("/banner/create")} size="sm" className="mb-4">배너 추가</Button>
        <H3>전체 배너</H3>
        <Table rows={allBanners} rowKey={(row) => row.id} columns={columns} context={{ handleDeleteBanner }} />
        <H3>홈 배너 (앱에 노출되는 것과 동일)</H3>
        <Table rows={homeBanners} rowKey={(row) => row.id} columns={columns} context={{ handleDeleteBanner }} />
      </Contents.Normal>
    </>
  )
}

interface TableContext {
  handleDeleteBanner: (banner: Banner) => Promise<void>
}
const col = makeTypedColumn<Banner, TableContext>()
const columns = [
  col({
    title: "로깅 키",
    field: "loggingKey",
    render: (loggingKey) => <p>{loggingKey}</p>,
  }),
  col({
    title: "랜딩 페이지 제목",
    field: "clickPageTitle",
    render: (clickPageTitle) => <p>{clickPageTitle}</p>,
  }),
  col({
    title: "랜딩 페이지 링크",
    field: "clickPageUrl",
    render: (clickPageUrl) => (
      <Button variant="outline" size="sm" asChild>
        <a href={clickPageUrl} target="_blank">
          오픈
        </a>
      </Button>
    ),
  }),
  col({
    title: "배너 노출 순서",
    field: "displayOrder",
    render: (displayOrder) => (displayOrder),
  }),
  col({
    title: "배너 사진",
    field: "imageUrl",
    render: (imageUrl) => (
      <S.ImageWrapper>
        <Image width={300} height={100} src={imageUrl} alt="" />
      </S.ImageWrapper>
    ),
  }),
  col({
    title: "배너 노출 기간",
    field: "_",
    render: (_, row) => (
      <>
        <p>시작 : {row.startAt ? formatDate(new Date(row.startAt!.value), dateFormat) : "-"}</p>
        <p>종료 : {row.endAt ? formatDate(new Date(row.endAt!.value), dateFormat) : "-"}</p>
      </>
    ),
  }),
  col({
    title: "삭제",
    field: "_",
    render: (_, row, ctx) => <S.DeleteButton onClick={() => ctx!.handleDeleteBanner(row)}>삭제</S.DeleteButton>,
  }),
]

const dateFormat = "yyyy.MM.dd HH:mm"
