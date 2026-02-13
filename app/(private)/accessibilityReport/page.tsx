"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useCallback } from "react"
import { toast } from "react-toastify"

import { Card, CardContent } from "@/components/ui/card"
import { Contents } from "@/components/layout"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useModal } from "@/hooks/useModal"
import { useAccessibilityReports, useResolveAccessibilityReport } from "@/lib/apis/accessibilityReport"
import type { AdminAccessibilityReportListItemDTO } from "@/lib/generated-sources/openapi"
import { AdminResolveAccessibilityReportRequestDTOActionEnum } from "@/lib/generated-sources/openapi"

import { getColumns } from "./components/columns"

type StatusFilter = "ALL" | "PENDING" | "RESOLVED" | "DISMISSED"

const statusFilterLabels: Record<StatusFilter, string> = {
  ALL: "전체",
  PENDING: "미처리",
  RESOLVED: "처리완료",
  DISMISSED: "무시",
}

const validStatuses = new Set<string>(["ALL", "PENDING", "RESOLVED", "DISMISSED"])

export default function AccessibilityReportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawStatus = searchParams.get("status")
  const statusFilter: StatusFilter =
    rawStatus && validStatuses.has(rawStatus) ? (rawStatus as StatusFilter) : "PENDING"

  const setStatusFilter = useCallback(
    (value: StatusFilter) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("status", value)
      router.replace(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  const modal = useModal()

  const queryFilter = statusFilter === "ALL" ? undefined : (statusFilter as "PENDING" | "RESOLVED" | "DISMISSED")
  const { data, isLoading, fetchNextPage, hasNextPage } = useAccessibilityReports(queryFilter)
  const { mutateAsync: resolveReport } = useResolveAccessibilityReport()

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  )

  const handleResolve = useCallback(
    async (report: AdminAccessibilityReportListItemDTO) => {
      if (!confirm("수정 없이 처리 완료합니다. 신고자에게 푸시 알림이 발송됩니다.")) return
      try {
        await resolveReport({
          id: report.id,
          request: { action: AdminResolveAccessibilityReportRequestDTOActionEnum.Resolve },
        })
        toast.success("신고가 처리 완료되었습니다.")
      } catch {
        toast.error("처리에 실패했습니다.")
      }
    },
    [resolveReport],
  )

  const handleDismiss = useCallback(
    async (report: AdminAccessibilityReportListItemDTO) => {
      if (!confirm("이 신고를 무시합니다. 푸시 알림이 발송되지 않습니다.")) return
      try {
        await resolveReport({
          id: report.id,
          request: { action: AdminResolveAccessibilityReportRequestDTOActionEnum.Dismiss },
        })
        toast.success("신고가 무시 처리되었습니다.")
      } catch {
        toast.error("처리에 실패했습니다.")
      }
    },
    [resolveReport],
  )

  const handleViewDetail = useCallback(
    (report: AdminAccessibilityReportListItemDTO) => {
      modal.openModal({
        type: "AccessibilityReportDetail",
        props: { reportId: report.id },
      })
    },
    [modal],
  )

  const columns = useMemo(
    () => getColumns({ onResolve: handleResolve, onDismiss: handleDismiss, onViewDetail: handleViewDetail }),
    [handleResolve, handleDismiss, handleViewDetail],
  )

  return (
    <Contents.Normal>
      <div className="mb-4">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            {(Object.keys(statusFilterLabels) as StatusFilter[]).map((key) => (
              <TabsTrigger key={key} value={key}>
                {statusFilterLabels[key]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              onLoadMore={hasNextPage ? () => fetchNextPage() : undefined}
              hasMore={hasNextPage}
            />
          )}
        </CardContent>
      </Card>
    </Contents.Normal>
  )
}
