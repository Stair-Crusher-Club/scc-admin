import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { api } from "@/lib/apis/api"

// TODO: Define your search parameters type
interface SearchParams {
  query?: string
  // Add other search parameters
}

// TODO: Define your response types to match the API
interface FeatureItem {
  id: string
  name: string
  // Add other fields
}

interface FeatureListResponse {
  items: FeatureItem[]
  cursor: string | null
}

/**
 * Hook for fetching paginated list of features
 * @param params Search parameters
 */
export function useFeatureList(params?: SearchParams) {
  return useInfiniteQuery({
    queryKey: ["@features", params], // Include params in query key for caching
    queryFn: ({ pageParam }) =>
      api.default
        .getFeatures(
          pageParam ?? undefined,
          "100", // Page size
          params?.query,
          // Add other parameters
        )
        .then((res) => res.data as FeatureListResponse),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: !!params, // Optional: only fetch when params are provided
  })
}

/**
 * Hook for fetching a single feature by ID
 * @param id Feature ID
 */
export function useFeature({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@feature", id],
    queryFn: () =>
      api.default.getFeature(id).then((res) => res.data as FeatureItem),
  })
}

// Additional hooks for other operations can be added here
// Example: useCreateFeature, useUpdateFeature, useDeleteFeature
