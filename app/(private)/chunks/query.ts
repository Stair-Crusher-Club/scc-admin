import { useMutation } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { LocationDTO } from "@/lib/generated-sources/openapi"

export function useCrawling() {
  return useMutation({
    mutationFn: (boundaryVertices: LocationDTO[]) => api.default.startPlaceCrawling({ boundaryVertices }),
  })
}
