import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"

export function useExperimentAssignments(userId: string) {
  return useQuery({
    queryKey: ["@experimentAssignments", userId],
    queryFn: () => api.experiment.searchExperimentAssignments(userId).then((res) => res.data),
    enabled: !!userId,
  })
}

export function useExperimentDefinitions() {
  return useQuery({
    queryKey: ["@experimentDefinitions"],
    queryFn: () => api.experiment.listExperiments().then((res) => res.data),
  })
}

export function useUpdateExperimentAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, variant }: { id: string; variant: string }) =>
      api.experiment.updateExperimentAssignment(id, { variant }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@experimentAssignments"] })
    },
  })
}
