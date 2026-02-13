"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Check, Eye, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import type {
  AdminAccessibilityReportListItemDTO,
  AccessibilityReportReasonDTO,
  ReportTargetTypeDTO,
} from "@/lib/generated-sources/openapi"

const targetTypeLabels: Record<ReportTargetTypeDTO, string> = {
  PLACE_ACCESSIBILITY: "장소 접근성",
  BUILDING_ACCESSIBILITY: "건물 접근성",
  PLACE_REVIEW: "장소 리뷰",
  TOILET_REVIEW: "화장실 리뷰",
}

const reasonLabels: Record<AccessibilityReportReasonDTO, string> = {
  INACCURATE_INFO: "틀린 정보",
  CLOSED: "폐점",
  BAD_USER: "정복자 차단",
  NONE: "기타",
}

export function getColumns({
  onResolve,
  onDismiss,
  onViewDetail,
}: {
  onResolve: (report: AdminAccessibilityReportListItemDTO) => void
  onDismiss: (report: AdminAccessibilityReportListItemDTO) => void
  onViewDetail: (report: AdminAccessibilityReportListItemDTO) => void
}): ColumnDef<AdminAccessibilityReportListItemDTO>[] {
  return [
    {
      accessorKey: "placeName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="장소명" />,
      cell: ({ row }) => (
        <div className="font-medium">{row.original.placeName ?? "-"}</div>
      ),
    },
    {
      accessorKey: "targetType",
      header: "신고 유형",
      cell: ({ row }) => (
        <div className="text-sm">{targetTypeLabels[row.original.targetType] ?? row.original.targetType}</div>
      ),
    },
    {
      accessorKey: "reason",
      header: "신고 사유",
      cell: ({ row }) => (
        <div className="text-sm">{reasonLabels[row.original.reason] ?? row.original.reason}</div>
      ),
    },
    {
      accessorKey: "reporterNickname",
      header: "신고자",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.reporterNickname ?? "익명"}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="신고일" />,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "yyyy.MM.dd HH:mm")}
        </div>
      ),
    },
    {
      accessorKey: "resolvedStatus",
      header: "처리 상태",
      cell: ({ row }) => {
        const status = row.original.resolvedStatus
        const isAutoResolved = row.original.isAutoResolved
        if (!status) {
          return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">미처리</span>
        }
        if (status === "RESOLVED") {
          return (
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">처리완료</span>
              {isAutoResolved && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">AI</span>
              )}
            </span>
          )
        }
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">무시</span>
      },
    },
    {
      id: "actions",
      header: "액션",
      cell: ({ row }) => {
        const report = row.original
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs"
              onClick={() => onViewDetail(report)}
            >
              <Eye className="h-3 w-3" />
              상세
            </Button>
            {!report.resolvedStatus && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  onClick={() => onResolve(report)}
                >
                  <Check className="h-3 w-3" />
                  처리 완료
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-xs text-muted-foreground"
                  onClick={() => onDismiss(report)}
                >
                  <X className="h-3 w-3" />
                  무시
                </Button>
              </>
            )}
          </div>
        )
      },
    },
  ]
}
