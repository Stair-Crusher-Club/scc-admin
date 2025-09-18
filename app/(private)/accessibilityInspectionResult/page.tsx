"use client"

import { useMemo, useState } from "react"

import { useAccessibilityInspectionResults } from "@/lib/apis/api"
import { AccessibilityTypeDTO } from "@/lib/generated-sources/openapi"

import { Contents, Header } from "@/components/layout"

import * as S from "./page.style"
import RemoteImage from "@/components/RemoteImage"

export default function AccessibilityInspectionResultPage() {
  const [accessibilityType, setAccessibilityType] = useState<AccessibilityTypeDTO | undefined>()
  const [isPassed, setIsPassed] = useState<boolean | undefined>()
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useAccessibilityInspectionResults({
      accessibilityType,
      isPassed,
      createdAtFromLocalDate: fromDate || undefined,
      createdAtToLocalDate: toDate || undefined,
    })

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])

  return (
    <>
      <Header title="접근성 검증 결과">
        <S.Filters>
          <label>
            유형
            <S.Select
              value={accessibilityType ?? ""}
              onChange={(e) =>
                setAccessibilityType(
                  (e.target.value || undefined) as AccessibilityTypeDTO | undefined,
                )
              }
            >
              <option value="">전체</option>
              <option value="PLACE">PLACE</option>
              <option value="BUILDING">BUILDING</option>
            </S.Select>
          </label>
          <label>
            합격여부
            <S.Select
              value={typeof isPassed === "boolean" ? String(isPassed) : ""}
              onChange={(e) =>
                setIsPassed(e.target.value === "" ? undefined : e.target.value === "true")
              }
            >
              <option value="">전체</option>
              <option value="true">합격</option>
              <option value="false">불합격</option>
            </S.Select>
          </label>
          <label>
            시작일
            <S.Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label>
            종료일
            <S.Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <S.Button onClick={() => refetch()}>검색</S.Button>
        </S.Filters>
      </Header>
      <Contents.Normal>
        <S.TableWrapper>
          <S.TableHeader>
            <S.HeaderCell>생성일</S.HeaderCell>
            <S.HeaderCell>유형</S.HeaderCell>
            <S.HeaderCell>검증결과</S.HeaderCell>
            <S.HeaderCell>설명</S.HeaderCell>
            <S.HeaderCell>이미지</S.HeaderCell>
          </S.TableHeader>
          {isLoading ? (
            <p>로딩 중...</p>
          ) : items.length === 0 ? (
            <p>결과가 없습니다.</p>
          ) : (
            items.map((item) => (
              <S.RowWrapper key={item.id}>
                <S.Cell>{new Date(item.createdAtMillis).toLocaleString()}</S.Cell>
                <S.Cell>{item.accessibilityType}</S.Cell>
                <S.Cell>{item.isPassed ? "합격" : "불합격"}</S.Cell>
                <S.Cell>
                  {item.imageInspectionResult?.description}
                </S.Cell>
                <S.ImagesCell>
                  <S.ThumbGrid>
                    {(item.images ?? item.imageInspectionResult?.images ?? []).map((img: any, idx) => (
                      <RemoteImage
                        key={idx}
                        src={(img.thumbnailUrl ?? img.imageUrl ?? img.url) as string}
                        width={120}
                        height={90}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                      />
                    ))}
                  </S.ThumbGrid>
                </S.ImagesCell>
              </S.RowWrapper>
            ))
          )}
        </S.TableWrapper>
        {hasNextPage && (
          <div style={{ marginTop: 12 }}>
            <S.Button disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
              더 불러오기
            </S.Button>
          </div>
        )}
      </Contents.Normal>
    </>
  )
}


