import { useQuery } from "@tanstack/react-query"

import { AccessibilitySummary, ENTRANCE_DOOR_TYPE, STAIR_HEIGHT_LEVEL, STAIR_INFO } from "@/lib/models/accessibility"
import { EpochMillisTimestamp, LatLng } from "@/lib/models/common"

import { AccessibilityApi, BannerApi, ChallengeApi, DefaultApi } from "../../lib/generated-sources/openapi"
import { QuestBuilding, QuestPlace, QuestPurposeType } from "../models/quest"
import { Region } from "../models/region"

const defaultApi = new DefaultApi()
const challengeApi = new ChallengeApi()
const bannerApi = new BannerApi()
const accessibilityApi = new AccessibilityApi()

export const api: DefaultApi & ChallengeApi & BannerApi & AccessibilityApi = {
  ...defaultApi,
  ...challengeApi,
  ...bannerApi,
  ...accessibilityApi,
} as DefaultApi & ChallengeApi & BannerApi & AccessibilityApi

export { accessibilityApi }

export function useQuest({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@quests", id],
    queryFn: async ({ queryKey }) => {
      const result = await api.clubQuestsClubQuestIdGet(queryKey[1])
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
    await api.clubQuestsClubQuestIdIsClosedPut(questId, { placeId, buildingId, isClosed })
  }
  if (typeof isNotAccessible == "boolean") {
    await api.clubQuestsClubQuestIdIsNotAccessiblePut(questId, { placeId, buildingId, isNotAccessible })
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
  centerLocation?: LatLng
  clusterCount?: number
  points?: LatLng[]
  maxPlaceCountPerQuest: number
  radiusMeters: number
  useAlreadyCrawledPlace: boolean
  questTargetPlaceCategories: ClubQuestTargetPlaceCategory[]
}
export interface ClusterPreview {
  questNamePostfix: string
  targetBuildings: QuestBuilding[]
}

export async function previewDivisions(params: PreviewDivisionsParams) {
  return api.clubQuestsCreateDryRunPost({
    ...params,
    clusterCount: params.clusterCount ?? 0,
      maxPlaceCountPerQuest: params.maxPlaceCountPerQuest,
    })
    .then((res) => res.data)
}

type CreateQuestPayload = {
  questNamePrefix: string
  purposeType: QuestPurposeType
  startAt: EpochMillisTimestamp
  endAt: EpochMillisTimestamp
  dryRunResults: ClusterPreview[]
}
export async function createQuest(payload: CreateQuestPayload) {
  return api.clubQuestsCreateDryRunPost({
    ...payload,
    clusterCount: 0,
    maxPlaceCountPerQuest: 0,
  })
}

type DeleteQuestPayload = {
  questId: string
}
export async function deleteQuest(payload: DeleteQuestPayload) {
  return api.clubQuestsClubQuestIdDelete(payload.questId)
}

export async function deleteQuestTargetPlace(questId: string, place: QuestPlace) {
  return api.clubQuestsClubQuestIdTargetPlacesDelete(questId, place.placeId)
}

export async function deleteQuestTargetBuilding(questId: string, building: QuestBuilding) {
  return api.clubQuestsClubQuestIdTargetBuildingsDelete(questId, building.buildingId)
}

export function useChallenges() {
  const api = new ChallengeApi()
  return useQuery({
    queryKey: ["@challenges"],
    queryFn: () => api.challengesGet().then((res) => res.data),
  })
}

export function useChallenge({ id }: { id: string }) {
  const api = new ChallengeApi()
  return useQuery({
    queryKey: ["@challenges", id] as const,
    queryFn: ({ queryKey }) => api.challengesChallengeIdGet(queryKey[1]).then((res) => res.data),
  })
}

type CreateChallengeParams = {
  name: string
  isPublic: boolean
  invitationCode?: string
  passcode?: string
  startsAtMillis: number
  endsAtMillis?: number
  goal: number
  milestones: number[]
  conditions: {
    addressCondition: { rawEupMyeonDongs: string[] }
    actionCondition: { types: string[] }
  }[]
  description: string
}
export function createChallenge(payload: CreateChallengeParams) {
  return api.challengesPost({
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

export function deleteChallenge({ id }: { id: string }) {
  return api.challengesChallengeIdDelete(id)
}

export function useRegions() {
  return useQuery({
    queryKey: ["@regions"],
    queryFn: () => api.accessibilityAllowedRegionsGet().then((res) => res.data),
  })
}

export function createRegion({ name, boundaryVertices }: { name: string; boundaryVertices: LatLng[] }) {
  return api.accessibilityAllowedRegionsPost({ name, boundaryVertices })
}

export function deleteRegion({ id }: { id: string }) {
  return api.accessibilityAllowedRegionsRegionIdDelete(id)
}

export interface SearchAccessibilitiesPayload {
  placeName: string
  createdAtFromLocalDate: string
  createdAtToLocalDate: string
}

export interface SearchAccessibilitiesResult {
  items: AccessibilitySummary[]
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
  stairInfo: STAIR_INFO
  stairHeightLevel?: STAIR_HEIGHT_LEVEL
  hasSlope: boolean
  entranceDoorTypes?: ENTRANCE_DOOR_TYPE[]
}

export interface UpdateBuildingAccessibilityPayload {
  hasElevator: boolean
  hasSlope: boolean
  entranceStairInfo: STAIR_INFO
  entranceStairHeightLevel?: STAIR_HEIGHT_LEVEL
  entranceDoorTypes?: ENTRANCE_DOOR_TYPE[]
  elevatorStairInfo: STAIR_INFO
  elevatorStairHeightLevel?: STAIR_HEIGHT_LEVEL
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

export function crawlChunk({ boundary }: { boundary: LatLng[] }) {
  return api.startPlaceCrawling({ boundaryVertices: boundary })
}

export type ImageUploadPurposeType = "BANNER"
export function getImageUploadUrls({
  purposeType,
  count,
  filenameExtension,
}: {
  purposeType: ImageUploadPurposeType
  count: number
  filenameExtension: string
}): Promise<GetImageUploadUrlsResult> {
  return api
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

export interface SendPushNotificationPayload {
  userIds: string[]
  notification: PushNotification
}

export interface PushNotification {
  title?: string
  body: string
  deepLink?: string
}

export function sendPushNotification(payload: SendPushNotificationPayload) {
  return api.adminSendPushNotification(payload)
}
