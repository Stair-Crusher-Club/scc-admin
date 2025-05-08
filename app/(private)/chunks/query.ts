import { useMutation } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { LatLng } from "@/lib/models/common"

export function useCrawling() {
  return useMutation({
    mutationFn: (boundaryVertices: LatLng[]) => api.default.startPlaceCrawling({ boundaryVertices }),
  })
}
