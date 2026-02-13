import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type {
  AdminResolveAccessibilityReportRequestDTO,
} from "@/lib/generated-sources/openapi"
import { api } from "./api"

type StatusFilter = "PENDING" | "RESOLVED" | "DISMISSED"

export function useAccessibilityReports(statusFilter?: StatusFilter) {
  return useInfiniteQuery({
    queryKey: ["@accessibility-reports", statusFilter ?? null],
    queryFn: ({ pageParam }) =>
      api.accessibilityReport
        .adminListAccessibilityReports(statusFilter, pageParam ?? undefined, 20)
        .then((res) => res.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
  })
}

export function useAccessibilityReportDetail(id: string) {
  return useQuery({
    queryKey: ["@accessibility-reports", "detail", id],
    queryFn: () => api.accessibilityReport.adminGetAccessibilityReportDetail(id).then((res) => res.data),
    enabled: !!id,
  })
}

export function useResolveAccessibilityReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: AdminResolveAccessibilityReportRequestDTO }) =>
      api.accessibilityReport.adminResolveAccessibilityReport(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@accessibility-reports"] })
    },
  })
}
