import { useQuery } from "@tanstack/react-query"

import { AccessibilitySummary } from "@/lib/models/accessibility"
import { EpochMillisTimestamp, LatLng } from "@/lib/models/common"

import { http } from "../http"
import { Challenge } from "../models/challenge"
import { QuestBuilding, QuestDetail, QuestPurposeType, QuestSummary } from "../models/quest"
import { Region } from "../models/region"

export function useQuest({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@quests", id],
    queryFn: ({ queryKey }) =>
      http(`/admin/clubQuests/${queryKey[1]}`).then((res) => res.json() as Promise<QuestDetail>),
  })
}

type UpdateQuestStatusParams = {
  questId: string
  placeId: string
  buildingId: string
  isClosed?: boolean
  isNotAccessible?: boolean
}
export async function updateQuestStatus({ questId, ...params }: UpdateQuestStatusParams) {
  if (typeof params.isClosed == "boolean") {
    await http(`/admin/clubQuests/${questId}/isClosed`, {
      method: "PUT",
      body: JSON.stringify(params),
    })
  }
  if (typeof params.isNotAccessible == "boolean") {
    await http(`/admin/clubQuests/${questId}/isNotAccessible`, {
      method: "PUT",
      body: JSON.stringify(params),
    })
  }
}

export type ClubQuestCreateRegionType = "CIRCLE" | "POLYGON"

type PreviewDivisionsParams = {
  regionType: ClubQuestCreateRegionType
  centerLocation?: LatLng
  clusterCount?: number
  points?: LatLng[]
  maxPlaceCountPerQuest: number
  radiusMeters: number
  useAlreadyCrawledPlace: boolean
}
export interface ClusterPreview {
  questNamePostfix: string
  targetBuildings: QuestBuilding[]
}

export async function previewDivisions(params: PreviewDivisionsParams) {
  return http(`/admin/clubQuests/create/dryRun`, {
    method: "POST",
    body: JSON.stringify(params),
  })
}

type CreateQuestPayload = {
  questNamePrefix: string
  purposeType: QuestPurposeType
  startAt: EpochMillisTimestamp
  endAt: EpochMillisTimestamp
  dryRunResults: ClusterPreview[]
}
export async function createQuest(payload: CreateQuestPayload) {
  return http(`/admin/clubQuests/create`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

type DeleteQuestPayload = {
  questId: string
}
export async function deleteQuest(payload: DeleteQuestPayload) {
  return http(`/admin/clubQuests/${payload.questId}`, {
    method: "DELETE",
  })
}

export function useChallenges() {
  return useQuery({
    queryKey: ["@challenges"],
    queryFn: () => http(`/admin/challenges`).then((res) => res.json() as Promise<Challenge[]>),
  })
}

export function useChallenge({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@challenges", id] as const,
    queryFn: ({ queryKey }) => http(`/admin/challenges/${queryKey[1]}`).then((res) => res.json() as Promise<Challenge>),
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
  return http(`/admin/challenges`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function deleteChallenge({ id }: { id: string }) {
  return http(`/admin/challenges/${id}`, {
    method: "DELETE",
  })
}

export function useRegions() {
  return useQuery({
    queryKey: ["@regions"],
    queryFn: () => http(`/admin/accessibilityAllowedRegions`).then((res) => res.json() as Promise<Region[]>),
  })
}

export function createRegion({ name, boundaryVertices }: { name: string; boundaryVertices: LatLng[] }) {
  return http(`/admin/accessibilityAllowedRegions`, {
    method: "POST",
    body: JSON.stringify({ name, boundaryVertices }),
  })
}

export function deleteRegion({ id }: { id: string }) {
  return http(`/admin/accessibilityAllowedRegions/${id}`, {
    method: "DELETE",
  })
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
  return http(`/admin/place-accessibilities/${id}`, {
    method: "DELETE",
  })
}

export function deleteBuildingAccessibility({ id }: { id: string }) {
  return http(`/admin/building-accessibilities/${id}`, {
    method: "DELETE",
  })
}

export function crawlChunk({ boundary }: { boundary: LatLng[] }) {
  return http("/admin/places/startCrawling", {
    method: "POST",
    body: JSON.stringify({ boundaryVertices: boundary }),
  })
}
