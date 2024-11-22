import { BasicModalProps } from "@reactleaf/modal"
import { useQueryClient } from "@tanstack/react-query"
import { useAtom } from "jotai"
import { useEffect, useMemo } from "react"

import { useQuestBuilding } from "@/lib/apis/api"
import { AppState } from "@/lib/globalAtoms"
import { QuestBuilding, QuestPlace } from "@/lib/models/quest"

import Reload from "@/icons/Reload"
import BottomSheet from "@/modals/_template/BottomSheet"

import * as S from "./BuildingDetailSheet.style"
import PlaceCard from "./PlaceCard"

interface Props extends BasicModalProps {
  building: QuestBuilding
  questId: string
}

export const defaultOverlayOptions = { closeDelay: 200, dim: false }
export default function BuildingDetailSheet({ building: initialData, questId, visible, close }: Props) {
  const { data: building } = useQuestBuilding({ questId, buildingId: initialData.buildingId })
  const [appState, setAppState] = useAtom(AppState)
  const queryClient = useQueryClient()

  useEffect(() => {
    setAppState((prev) => ({ ...prev, isHeaderHidden: true }))
    return () => {
      setAppState((prev) => ({ ...prev, isHeaderHidden: false }))
    }
  }, [])

  function reloadQuest() {
    queryClient.invalidateQueries({ queryKey: ["@quests", questId] })
  }

  const isConquered = (place: QuestPlace) => place.isConquered || place.isNotAccessible || place.isClosed

  // 활동 중 장소 순서가 바뀌는 것을 막습니다.
  const sortedPlaces = useMemo(() => {
    if (!building) return []
    const conquered = initialData.places.filter(isConquered)
    const notConquered = initialData.places.filter((p) => !isConquered(p))
    return [...notConquered, ...conquered].map((p) => building.places.find((b) => b.placeId === p.placeId) || p)
  }, [initialData, building])

  if (!building) return null

  const conquered = building.places.filter(isConquered)
  const title = (
    <S.CustomTitle>
      <h5>{building.name}</h5>
      <small>
        정복 완료 {conquered.length} / {building.places.length}
      </small>
      <S.ReloadButton onClick={reloadQuest}>
        <Reload size={24} />
      </S.ReloadButton>
    </S.CustomTitle>
  )

  return (
    <BottomSheet visible={visible} close={close} title={title} style={{ height: "calc(100vh - 300px)" }}>
      {sortedPlaces.map((place) => (
        <PlaceCard place={place} questId={questId} key={place.placeId} />
      ))}
    </BottomSheet>
  )
}
