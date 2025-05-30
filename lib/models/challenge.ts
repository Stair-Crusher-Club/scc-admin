import { CrusherGroup } from "../apis/api"

export const ChallengeActionMap = {
  BUILDING_ACCESSIBILITY: "건물 정보 등록",
  BUILDING_ACCESSIBILITY_COMMENT: "건물 코멘트 등록",
  PLACE_ACCESSIBILITY: "장소 정보 등록",
  PLACE_ACCESSIBILITY_COMMENT: "장소 코멘트 등록",
} as const

export type ChallengeAction = keyof typeof ChallengeActionMap

export interface Challenge {
  id: string
  name: string
  isPublic: true
  passcode?: string
  invitationCode?: string
  crusherGroup?: CrusherGroup
  isComplete: false
  startsAtMillis: number
  goal: number
  milestones: number[]
  conditions: [
    {
      addressCondition: { rawEupMyeonDongs: string[] }
      actionCondition: { types: ChallengeAction[] }
    },
  ]
  createdAtMillis: number
  updatedAtMillis: number
  description: string
  endsAtMillis: number
}
