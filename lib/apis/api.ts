import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import {
  AdminAccessibilityDTO,
  AdminAccessibilityInspectionResultDTO,
  AdminChallengeB2bFormSchemaDTO,
  AdminCreateSearchPlacePresetRequestDTO,
  AdminEntranceDoorType,
  AdminImageUploadPurposeTypeDTO,
  AdminSearchAccessibilityInspectionResultsDTO,
  AdminSendPushNotificationRequestDTO,
  AdminStairHeightLevel,
  AdminStairInfoDTO,
  AdminUpdateChallengeRequestDTO,
  AdminUpdatePushNotificationScheduleRequestDTO,
  AccessibilityTypeDTO,
  ClubQuestCreateDryRunResultItemDTO,
  EpochMillisTimestamp,
  InspectorTypeDTO,
  ResultTypeDTO,
} from "@/lib/generated-sources/openapi"

import {
  AccessibilityApi,
  AccessibilityReportApi,
  BannerApi,
  BbucleRoadApi,
  ChallengeApi,
  Configuration,
  DefaultApi,
  HomeAnnouncementApi,
  HomeRecommendedContentApi,
  PlaceCategoryCacheApi,
  PlaceListApi,
} from "../../lib/generated-sources/openapi"
import {
  ClubQuestPurposeTypeEnumDTO,
  ClubQuestTargetBuildingDTO,
  ClubQuestTargetPlaceDTO,
  LocationDTO,
} from "../generated-sources/openapi"

const baseURL =
  process.env.NEXT_PUBLIC_DEPLOY_TYPE === "live"
    ? "https://api.staircrusher.club/admin"
    : process.env.NEXT_PUBLIC_DEPLOY_TYPE === "local"
      ? "http://localhost:8080/admin"
      : "https://api.dev.staircrusher.club/admin"
const config = new Configuration({ basePath: baseURL })
const defaultApi = new DefaultApi(config)
const challengeApi = new ChallengeApi(config)
const bannerApi = new BannerApi(config)
const accessibilityApi = new AccessibilityApi(config)
const bbucleRoadApi = new BbucleRoadApi(config)
const placeCategoryCacheApi = new PlaceCategoryCacheApi(config)
const homeAnnouncementApi = new HomeAnnouncementApi(config)
const homeRecommendedContentApi = new HomeRecommendedContentApi(config)
const placeListApi = new PlaceListApi(config)
const accessibilityReportApi = new AccessibilityReportApi(config)

export const api: {
  default: DefaultApi
  challenge: ChallengeApi
  banner: BannerApi
  accessibility: AccessibilityApi
  accessibilityReport: AccessibilityReportApi
  bbucleRoad: BbucleRoadApi
  placeCategoryCache: PlaceCategoryCacheApi
  homeAnnouncement: HomeAnnouncementApi
  homeRecommendedContent: HomeRecommendedContentApi
  placeList: PlaceListApi
} = {
  default: defaultApi,
  challenge: challengeApi,
  banner: bannerApi,
  accessibility: accessibilityApi,
  accessibilityReport: accessibilityReportApi,
  bbucleRoad: bbucleRoadApi,
  placeCategoryCache: placeCategoryCacheApi,
  homeAnnouncement: homeAnnouncementApi,
  homeRecommendedContent: homeRecommendedContentApi,
  placeList: placeListApi,
}

export function useQuest({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@quests", id],
    queryFn: async ({ queryKey }) => {
      const result = await api.default.clubQuestsClubQuestIdGet(queryKey[1])
      return result.data
    },
    staleTime: 10 * 1000,
  })
}

export function useQuestsByGroupId({ groupId }: { groupId: string }) {
  return useQuery({
    queryKey: ["@questGroup", groupId],
    queryFn: async ({ queryKey }) => {
      const result = await api.default.getClubQuestsByGroupId(queryKey[1])
      return result.data
    },
    staleTime: 10 * 1000,
  })
}

// 특정 빌딩 정보만 가져오기
export function useQuestBuilding({ questId, buildingId }: { questId: string; buildingId: string }) {
  const { data, ...others } = useQuest({ id: questId })
  const building = data?.buildings.find((b) => b.buildingId === buildingId)
  return { data: building, ...others }
}

type UpdateQuestStatusParams = {
  questId: string
  placeId: string
  buildingId: string
  isClosed?: boolean
  isNotAccessible?: boolean
}
export async function updateQuestStatus({
  questId,
  placeId,
  buildingId,
  isClosed,
  isNotAccessible,
}: UpdateQuestStatusParams) {
  if (typeof isClosed == "boolean") {
    await api.default.clubQuestsClubQuestIdIsClosedPut(questId, { placeId, buildingId, isClosed })
  }
  if (typeof isNotAccessible == "boolean") {
    await api.default.clubQuestsClubQuestIdIsNotAccessiblePut(questId, { placeId, buildingId, isNotAccessible })
  }
}

export type ClubQuestCreateRegionType = "CIRCLE" | "POLYGON"
export type ClubQuestTargetPlaceCategory =
  | "RESTAURANT"
  | "CAFE"
  | "MARKET"
  | "HOSPITAL"
  | "PHARMACY"
  | "CONVENIENCE_STORE"
type PreviewDivisionsParams = {
  regionType: ClubQuestCreateRegionType
  centerLocation?: LocationDTO
  clusterCount?: number
  points?: LocationDTO[]
  maxPlaceCountPerQuest: number
  radiusMeters: number
  useAlreadyCrawledPlace: boolean
  questTargetPlaceCategories: ClubQuestTargetPlaceCategory[]
}
export interface ClusterPreview {
  questNamePostfix: string
  targetBuildings: ClubQuestTargetBuildingDTO[]
}

export async function previewDivisions(params: PreviewDivisionsParams) {
  return api.default
    .clubQuestsCreateDryRunPost({
      ...params,
      clusterCount: params.clusterCount ?? 0,
      maxPlaceCountPerQuest: params.maxPlaceCountPerQuest,
    })
    .then((res) => res.data)
}

type CreateQuestPayload = {
  questNamePrefix: string
  purposeType: ClubQuestPurposeTypeEnumDTO
  startAt: EpochMillisTimestamp
  endAt: EpochMillisTimestamp
  isAttendanceCheckEnabled?: boolean
  dryRunResults: ClubQuestCreateDryRunResultItemDTO[]
}
export async function createQuest(payload: CreateQuestPayload) {
  return api.default.createClubQuest({ ...payload })
}

type DeleteQuestPayload = {
  questId: string
}
export async function deleteQuest(payload: DeleteQuestPayload) {
  return api.default.clubQuestsClubQuestIdDelete(payload.questId)
}

export async function deleteQuestTargetPlace(questId: string, place: ClubQuestTargetPlaceDTO) {
  return api.default.clubQuestsClubQuestIdTargetPlacesDelete(questId, place.placeId)
}

export async function deleteQuestTargetBuilding(questId: string, building: ClubQuestTargetBuildingDTO) {
  return api.default.clubQuestsClubQuestIdTargetBuildingsDelete(questId, building.buildingId)
}

export async function moveQuestTargetPlace({
  questId,
  targetQuestId,
  placeIds,
}: {
  questId: string
  targetQuestId: string
  placeIds: string[]
}) {
  return api.default.moveClubQuestTargetPlace(questId, {
    targetQuestId,
    placeIds,
  })
}

export function useChallenges() {
  return useQuery({
    queryKey: ["@challenges"],
    queryFn: () => api.challenge.challengesGet().then((res) => res.data),
  })
}

export function useChallenge({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@challenges", id] as const,
    queryFn: ({ queryKey }) => api.challenge.challengesChallengeIdGet(queryKey[1]).then((res) => res.data),
  })
}

type CreateChallengeParams = {
  name: string
  isPublic: boolean
  invitationCode?: string
  passcode?: string
  startsAtMillis: number
  joinStartAtMillis?: number
  endsAtMillis?: number
  goal: number
  milestones: number[]
  conditions: {
    addressCondition: { rawEupMyeonDongs: string[] }
    actionCondition: { types: string[] }
  }[]
  description: string
  isB2B: boolean
  isRetroactiveContributionEnabled?: boolean
  b2bFormSchema?: AdminChallengeB2bFormSchemaDTO
  crusherGroup?: CrusherGroup
  lastMonthRankImageUrl?: string
  modalImageUrl?: string
}
export function createChallenge(payload: CreateChallengeParams) {
  return api.challenge.challengesPost({
    ...payload,
    conditions: payload.conditions.map((condition) => ({
      ...condition,
      actionCondition: {
        ...condition.actionCondition,
        types: condition.actionCondition.types as any[],
      },
    })),
  })
}

export function updateChallenge({ id, payload }: { id: string; payload: AdminUpdateChallengeRequestDTO }) {
  return api.challenge.challengesChallengeIdPut(id, payload)
}

export interface CrusherGroup {
  name: string
  icon?: ImageDto
}

export function deleteChallenge({ id }: { id: string }) {
  return api.challenge.challengesChallengeIdDelete(id)
}

export function useRegions() {
  return useQuery({
    queryKey: ["@regions"],
    queryFn: () => api.default.accessibilityAllowedRegionsGet().then((res) => res.data),
  })
}

export function createRegion({ name, boundaryVertices }: { name: string; boundaryVertices: LocationDTO[] }) {
  return api.default.accessibilityAllowedRegionsPost({ name, boundaryVertices })
}

export function deleteRegion({ id }: { id: string }) {
  return api.default.accessibilityAllowedRegionsRegionIdDelete(id)
}

export interface SearchAccessibilitiesPayload {
  placeName: string
  createdAtFromLocalDate: string
  createdAtToLocalDate: string
}

export interface SearchAccessibilitiesResult {
  items: AdminAccessibilityDTO[]
  cursor: string | null
}

export function deletePlaceAccessibility({ id }: { id: string }) {
  return accessibilityApi.deletePlaceAccessibility(id)
}

export function deleteBuildingAccessibility({ id }: { id: string }) {
  return accessibilityApi.deleteBuildingAccessibility(id)
}

export interface UpdatePlaceAccessibilityPayload {
  isFirstFloor: boolean
  floors?: number[]
  isStairOnlyOption?: boolean
  stairInfo: AdminStairInfoDTO
  stairHeightLevel?: AdminStairHeightLevel
  hasSlope: boolean
  entranceDoorTypes?: AdminEntranceDoorType[]
}

export interface UpdateBuildingAccessibilityPayload {
  hasElevator: boolean
  hasSlope: boolean
  entranceStairInfo: AdminStairInfoDTO
  entranceStairHeightLevel?: AdminStairHeightLevel
  entranceDoorTypes?: AdminEntranceDoorType[]
  elevatorStairInfo: AdminStairInfoDTO
  elevatorStairHeightLevel?: AdminStairHeightLevel
}

export function updatePlaceAccessibility({ id, payload }: { id: string; payload: UpdatePlaceAccessibilityPayload }) {
  return accessibilityApi.updatePlaceAccessibility(id, payload)
}

export function updateBuildingAccessibility({
  id,
  payload,
}: {
  id: string
  payload: UpdateBuildingAccessibilityPayload
}) {
  return accessibilityApi.updateBuildingAccessibility(id, payload)
}

export function crawlChunk({ boundary }: { boundary: LocationDTO[] }) {
  return api.default.startPlaceCrawling({ boundaryVertices: boundary })
}

export function getImageUploadUrls({
  purposeType,
  count,
  filenameExtension,
}: {
  purposeType: AdminImageUploadPurposeTypeDTO
  count: number
  filenameExtension: string
}): Promise<GetImageUploadUrlsResult> {
  return api.default
    .adminCreateImageUploadUrls({
      purposeType,
      count,
      filenameExtension,
    })
    .then((res) => res.data)
}
export interface GetImageUploadUrlsResult {
  urls: ImageUploadUrl[]
}
export interface ImageUploadUrl {
  url: string
}

export interface ImageDto {
  url: string
  width: number
  height: number
}

export function sendPushNotification(payload: AdminSendPushNotificationRequestDTO) {
  return defaultApi.adminSendPushNotification(payload)
}

export function usePushSchedules() {
  return useInfiniteQuery({
    queryKey: ["@pushSchedules"],
    queryFn: ({ pageParam }) => defaultApi.adminGetPushSchedules(pageParam ?? undefined, "10").then((res) => res.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

export function updatePushSchedule({
  id,
  payload,
}: {
  id: string
  payload: AdminUpdatePushNotificationScheduleRequestDTO
}) {
  return defaultApi.notificationsPushSchedulesScheduleIdPut(id, payload)
}

export function deletePushSchedule({ id }: { id: string }) {
  return defaultApi.notificationsPushSchedulesScheduleIdDelete(id)
}

export function useSearchPresets() {
  return useQuery({
    queryKey: ["@searchPresets"],
    queryFn: () => defaultApi.getSearchPreset().then((res) => res.data),
  })
}

export function createSearchPreset(searchText: string, description: string) {
  const payload: AdminCreateSearchPlacePresetRequestDTO = {
    searchText,
    description,
  }
  return defaultApi.createSearchPreset(payload)
}

export function deleteSearchPreset(id: string) {
  return defaultApi.deleteSearchPreset(id)
}

// Store cursors for pagination
const cursorCache = new Map<string, string[]>()

// Convert date string (yyyy-MM-dd) to epoch milliseconds in user's local timezone.
// The date string represents the start of the day (00:00:00) in the user's timezone,
// which is the intended behavior since users select dates based on their local time.
// For end date: adds one day to make it exclusive (e.g., "2025-12-05" becomes start of 2025-12-06)
function dateStringToEpochMillis(dateString: string | undefined, isEndDate: boolean): number | undefined {
  if (!dateString) return undefined
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return undefined
  if (isEndDate) {
    // For end date, add one day to make it exclusive
    date.setDate(date.getDate() + 1)
  }
  return date.getTime()
}

export function useAccessibilityInspectionResults({
  accessibilityType,
  inspectorType,
  resultType,
  isHandled,
  createdAtFromLocalDate,
  createdAtToLocalDate,
}: {
  accessibilityType?: AccessibilityTypeDTO
  inspectorType?: InspectorTypeDTO
  resultType?: ResultTypeDTO
  isHandled?: boolean
  createdAtFromLocalDate?: string
  createdAtToLocalDate?: string
}) {
  // Convert date strings to epoch milliseconds
  const createdAtFrom = dateStringToEpochMillis(createdAtFromLocalDate, false)
  const createdAtTo = dateStringToEpochMillis(createdAtToLocalDate, true)

  return useInfiniteQuery<AdminSearchAccessibilityInspectionResultsDTO>({
    queryKey: [
      "@accessibilityInspectionResults",
      accessibilityType ?? null,
      inspectorType ?? null,
      resultType ?? null,
      isHandled ?? null,
      createdAtFromLocalDate ?? null,
      createdAtToLocalDate ?? null,
    ],
    queryFn: ({ pageParam }) =>
      accessibilityApi
        .searchAccessibilityInspectionResults(
          undefined, // id
          accessibilityType,
          inspectorType,
          resultType,
          isHandled,
          createdAtFrom,
          createdAtTo,
          (pageParam as string | undefined) ?? undefined,
          "50",
        )
        .then((res) => res.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

export function useAccessibilityInspectionResultsPaginated({
  accessibilityType,
  inspectorType,
  resultType,
  isHandled,
  createdAtFromLocalDate,
  createdAtToLocalDate,
  page = 1,
  pageSize = 20,
}: {
  accessibilityType?: AccessibilityTypeDTO
  inspectorType?: InspectorTypeDTO
  resultType?: ResultTypeDTO
  isHandled?: boolean
  createdAtFromLocalDate?: string
  createdAtToLocalDate?: string
  page?: number
  pageSize?: number
}) {
  const cacheKey = JSON.stringify({
    accessibilityType: accessibilityType ?? null,
    inspectorType: inspectorType ?? null,
    resultType: resultType ?? null,
    isHandled: isHandled ?? null,
    createdAtFromLocalDate: createdAtFromLocalDate ?? null,
    createdAtToLocalDate: createdAtToLocalDate ?? null,
    pageSize,
  })

  return useQuery({
    queryKey: [
      "@accessibilityInspectionResultsPaginated",
      accessibilityType ?? null,
      inspectorType ?? null,
      resultType ?? null,
      isHandled ?? null,
      createdAtFromLocalDate ?? null,
      createdAtToLocalDate ?? null,
      page,
      pageSize,
    ],
    queryFn: async () => {
      // Convert date strings to epoch milliseconds
      const createdAtFrom = dateStringToEpochMillis(createdAtFromLocalDate, false)
      const createdAtTo = dateStringToEpochMillis(createdAtToLocalDate, true)

      // Real API call
      // Get or initialize cursor array for this query
      if (!cursorCache.has(cacheKey)) {
        cursorCache.set(cacheKey, [])
      }
      const cursors = cursorCache.get(cacheKey)!

      // Ensure we have enough cursors for the requested page
      while (cursors.length < page - 1) {
        const lastCursor = cursors[cursors.length - 1]
        const response = await accessibilityApi.searchAccessibilityInspectionResults(
          undefined, // id
          accessibilityType,
          inspectorType,
          resultType,
          isHandled,
          createdAtFrom,
          createdAtTo,
          lastCursor,
          pageSize.toString()
        )

        if (!response.data.cursor) break // No more pages
        cursors.push(response.data.cursor)
      }

      // Get cursor for current page
      const cursor = page === 1 ? undefined : cursors[page - 2]

      const response = await accessibilityApi.searchAccessibilityInspectionResults(
        undefined, // id
        accessibilityType,
        inspectorType,
        resultType,
        isHandled,
        createdAtFrom,
        createdAtTo,
        cursor,
        pageSize.toString()
      )

      // Update cursor cache if we got a new cursor
      if (response.data.cursor && cursors.length === page - 1) {
        cursors.push(response.data.cursor)
      }

      return {
        ...response.data,
        currentPage: page,
        pageSize,
        hasNextPage: !!response.data.cursor,
        totalPages: cursors.length + (response.data.cursor ? 1 : 0),
      }
    },
    placeholderData: (previousData) => previousData,
  })
}

export interface RunImagePipelinePayload {
  items: Array<{
    accessibilityId: string
    accessibilityType: AccessibilityTypeDTO
  }>
}

export function runImagePipeline(payload: RunImagePipelinePayload) {
  return accessibilityApi.runAccessibilityImagePipeline(payload)
}

import type { ApplyAccessibilityInspectionResultsRequestDto } from "@/lib/generated-sources/openapi"

export type ApplyAccessibilityInspectionResultsPayload = ApplyAccessibilityInspectionResultsRequestDto

export function applyAccessibilityInspectionResults(payload: ApplyAccessibilityInspectionResultsPayload) {
  return accessibilityApi.applyAccessibilityInspectionResults(payload)
}

import type {
  AdminCreatePlaceCategoryCacheRequestDto,
  AdminUpdatePlaceCategoryCacheRequestDto,
  PlaceCategoryDto,
} from "@/lib/generated-sources/openapi"

export function usePlaceCategoryCaches({
  placeCategory,
  categoryStringContains,
  limit = 20,
}: {
  placeCategory?: PlaceCategoryDto
  categoryStringContains?: string
  limit?: number
} = {}) {
  return useInfiniteQuery({
    queryKey: ["@placeCategoryCaches", placeCategory ?? null, categoryStringContains ?? null, limit],
    queryFn: ({ pageParam }) =>
      placeCategoryCacheApi
        .listPlaceCategoryCaches(pageParam ?? undefined, limit, placeCategory, categoryStringContains)
        .then((res) => res.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

export function usePlaceCategoryCache({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@placeCategoryCaches", id],
    queryFn: () => placeCategoryCacheApi.getPlaceCategoryCache(id).then((res) => res.data),
    enabled: !!id,
  })
}

export function createPlaceCategoryCache(payload: AdminCreatePlaceCategoryCacheRequestDto) {
  return placeCategoryCacheApi.createPlaceCategoryCache(payload)
}

export function updatePlaceCategoryCache({
  id,
  payload,
}: {
  id: string
  payload: AdminUpdatePlaceCategoryCacheRequestDto
}) {
  return placeCategoryCacheApi.updatePlaceCategoryCache(id, payload)
}

export function deletePlaceCategoryCache({ id }: { id: string }) {
  return placeCategoryCacheApi.deletePlaceCategoryCache(id)
}
