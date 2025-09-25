"use client"

import { useMemo, useState } from "react"
import { format as formatDate } from "date-fns"
import { useModal } from "@/hooks/useModal"

import { useAccessibilityInspectionResultsPaginated, runImagePipeline } from "@/lib/apis/api"
import { AccessibilityTypeDTO, AdminAccessibilityInspectionResultDTO } from "@/lib/generated-sources/openapi"

import { Contents, Header } from "@/components/layout"

import * as S from "./page.style"
import RemoteImage from "@/components/RemoteImage"

export default function AccessibilityInspectionResultPage() {
  const [accessibilityType, setAccessibilityType] = useState<AccessibilityTypeDTO | undefined>()
  const [isPassed, setIsPassed] = useState<boolean | undefined>()
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [isRunningPipeline, setIsRunningPipeline] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const modal = useModal()

  const { data, isLoading, refetch } = useAccessibilityInspectionResultsPaginated({
    accessibilityType,
    isPassed,
    createdAtFromLocalDate: fromDate || undefined,
    createdAtToLocalDate: toDate || undefined,
    page: currentPage,
    pageSize,
  })

  const items = data?.items ?? []
  const hasNextPage = data?.hasNextPage ?? false
  const totalPages = data?.totalPages ?? 1

  const handleRunReinspection = async (items: Array<{ accessibilityId: string; accessibilityType: AccessibilityTypeDTO }>) => {
    setIsRunningPipeline(true)
    try {
      await runImagePipeline({ items })
      alert("재검수가 성공적으로 실행되었습니다.")
      refetch() // 데이터 새로고침
    } catch (error) {
      console.error("재검수 실행 중 오류:", error)
      alert("재검수 실행 중 오류가 발생했습니다.")
    } finally {
      setIsRunningPipeline(false)
    }
  }

  const openReinspectionDialog = () => {
    modal.openModal({
      type: "ReinspectionDialog",
      props: {
        onConfirm: handleRunReinspection,
        isLoading: isRunningPipeline,
      }
    })
  }

  const toggleRowExpansion = (itemId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const loadImages = (itemId: string) => {
    setLoadedImages(prev => new Set(prev).add(itemId))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setExpandedRows(new Set()) // Reset expanded rows when changing pages
    setLoadedImages(new Set()) // Reset loaded images when changing pages
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
    setExpandedRows(new Set())
    setLoadedImages(new Set())
  }

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
    setExpandedRows(new Set())
    setLoadedImages(new Set())
  }

  return (
    <>
      <Header title="접근성 검증 결과" />
      <S.FiltersContainer>
        <S.Filters>
          <S.FilterLabel>
            유형
            <S.Select
              value={accessibilityType ?? ""}
              onChange={(e) => {
                setAccessibilityType(
                  (e.target.value || undefined) as AccessibilityTypeDTO | undefined,
                )
                handleFilterChange()
              }}
            >
              <option value="">전체</option>
              <option value="PLACE">PLACE</option>
              <option value="BUILDING">BUILDING</option>
            </S.Select>
          </S.FilterLabel>
          <S.FilterLabel>
            합격여부
            <S.Select
              value={typeof isPassed === "boolean" ? String(isPassed) : ""}
              onChange={(e) => {
                setIsPassed(e.target.value === "" ? undefined : e.target.value === "true")
                handleFilterChange()
              }}
            >
              <option value="">전체</option>
              <option value="true">합격</option>
              <option value="false">불합격</option>
            </S.Select>
          </S.FilterLabel>
          <S.FilterLabel>
            시작일
            <S.Input 
              type="date" 
              value={fromDate} 
              onChange={(e) => {
                setFromDate(e.target.value)
                handleFilterChange()
              }} 
            />
          </S.FilterLabel>
          <S.FilterLabel>
            종료일
            <S.Input 
              type="date" 
              value={toDate} 
              onChange={(e) => {
                setToDate(e.target.value)
                handleFilterChange()
              }} 
            />
          </S.FilterLabel>
          <S.FilterLabel>
            페이지 크기
            <S.Select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value="10">10개</option>
              <option value="20">20개</option>
              <option value="50">50개</option>
              <option value="100">100개</option>
            </S.Select>
          </S.FilterLabel>
          <S.Button onClick={() => {
            setAccessibilityType(undefined)
            setIsPassed(undefined)
            setFromDate("")
            setToDate("")
            handleFilterChange()
          }}>
            초기화
          </S.Button>
          <S.ReinspectionButton onClick={openReinspectionDialog} disabled={isRunningPipeline}>
            {isRunningPipeline ? "재검수 중..." : "재검수하기"}
          </S.ReinspectionButton>
        </S.Filters>
      </S.FiltersContainer>
      <Contents.Normal>
        <S.ResultsContainer>
          {isLoading ? (
            <S.LoadingMessage>로딩 중...</S.LoadingMessage>
          ) : items.length === 0 ? (
            <S.EmptyMessage>결과가 없습니다.</S.EmptyMessage>
          ) : (
            items.map((item) => {
              const isExpanded = expandedRows.has(item.id)
              const imagesLoaded = loadedImages.has(item.id)
              const images = item.images ?? item.imageInspectionResult?.images ?? []
              
              return (
                <S.ResultCard key={item.id}>
                  <S.CardHeader>
                    <S.CardTitle>
                      {item.accessibilityId} - {item.accessibilityType}
                    </S.CardTitle>
                    <S.CardStatus isPassed={item.isPassed}>
                      {item.isPassed ? "합격" : "불합격"}
                    </S.CardStatus>
                  </S.CardHeader>
                  
                  <S.CardContent>
                    <S.InfoGrid>
                      <S.InfoItem>
                        <S.InfoLabel>생성일</S.InfoLabel>
                        <S.InfoValue>{formatDate(new Date(item.createdAtMillis), "yyyy/M/d HH:mm")}</S.InfoValue>
                      </S.InfoItem>
                      <S.InfoItem>
                        <S.InfoLabel>설명</S.InfoLabel>
                        <S.InfoValue>{item.imageInspectionResult?.description || "설명 없음"}</S.InfoValue>
                      </S.InfoItem>
                    </S.InfoGrid>
                    
                    <S.ImageSection>
                      <S.ImageSectionTitle>이미지</S.ImageSectionTitle>
                      {images.length > 0 ? (
                        imagesLoaded ? (
                          <S.ThumbGrid>
                            {images.map((img: any, idx) => (
                              <RemoteImage
                                key={idx}
                                src={(img.thumbnailUrl ?? img.imageUrl ?? img.url) as string}
                                width={120}
                                height={90}
                                style={{ objectFit: "cover", borderRadius: 6 }}
                              />
                            ))}
                          </S.ThumbGrid>
                        ) : (
                          <S.LoadImagesButton onClick={() => loadImages(item.id)}>
                            이미지 로드 ({images.length}개)
                          </S.LoadImagesButton>
                        )
                      ) : (
                        <S.NoImagesText>이미지 없음</S.NoImagesText>
                      )}
                    </S.ImageSection>
                    
                    <S.ExpandButton onClick={() => toggleRowExpansion(item.id)}>
                      {isExpanded ? "상세 정보 접기" : "상세 정보 보기"}
                    </S.ExpandButton>
                  </S.CardContent>
                  
                  {isExpanded && (
                    <S.ExpandedDetails>
                      <S.DetailSection>
                        <S.DetailTitle>상세 검수 결과</S.DetailTitle>
                        
                        <S.DetailItem>
                          <S.DetailLabel>전체 코드</S.DetailLabel>
                          <S.CodeList>
                            {item.imageInspectionResult?.overallCodes?.map((code, idx) => (
                              <S.CodeItem key={idx}>{code}</S.CodeItem>
                            ))}
                          </S.CodeList>
                        </S.DetailItem>
                        
                        <S.DetailItem>
                          <S.DetailLabel>이미지별 상세</S.DetailLabel>
                          <S.ImageDetailsList>
                            {item.imageInspectionResult?.images?.map((imgDetail, idx) => (
                              <S.ImageDetailItem key={idx}>
                                <S.ImageDetailUrl>{imgDetail.url}</S.ImageDetailUrl>
                                <S.CodeList>
                                  {imgDetail.reasonCodes?.map((code, codeIdx) => (
                                    <S.CodeItem key={codeIdx}>{code}</S.CodeItem>
                                  ))}
                                </S.CodeList>
                              </S.ImageDetailItem>
                            ))}
                          </S.ImageDetailsList>
                        </S.DetailItem>
                        
                        <S.DetailItem>
                          <S.DetailLabel>생성일</S.DetailLabel>
                          <S.DetailValue>{formatDate(new Date(item.createdAtMillis), "yyyy-MM-dd HH:mm:ss")}</S.DetailValue>
                        </S.DetailItem>
                        
                        <S.DetailItem>
                          <S.DetailLabel>수정일</S.DetailLabel>
                          <S.DetailValue>{formatDate(new Date(item.updatedAtMillis), "yyyy-MM-dd HH:mm:ss")}</S.DetailValue>
                        </S.DetailItem>
                      </S.DetailSection>
                    </S.ExpandedDetails>
                  )}
                </S.ResultCard>
              )
            })
          )}
        </S.ResultsContainer>
        
        {items.length > 0 && (
          <S.PaginationContainer>
            <S.PaginationInfo>
              페이지 {currentPage} / {totalPages} (총 {items.length}개 항목)
            </S.PaginationInfo>
            <S.PaginationControls>
              <S.PaginationButton 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← 이전
              </S.PaginationButton>
              
              <S.PaginationButton 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
              >
                다음 →
              </S.PaginationButton>
            </S.PaginationControls>
          </S.PaginationContainer>
        )}
      </Contents.Normal>
    </>
  )
}


