import { BasicModalProps } from "@reactleaf/modal"
import { useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

import { deleteQuestTargetBuilding, useQuestBuilding } from "@/lib/apis/api"
import { QuestBuilding, QuestPlace } from "@/lib/models/quest"

import { useAuth } from "@/hooks/useAuth"
import Reload from "@/icons/Reload"

import deleteIcon from "../../../public/delete_button.png"
import RightSheet from "../_template/RightSheet"
import * as S from "./BuildingDetailSheet.style"
import PlaceCard from "./PlaceCard"

interface Props extends BasicModalProps {
  building: QuestBuilding
  questId: string
}

export const defaultOverlayOptions = { closeDelay: 200, dim: false }
export default function BuildingDetailSheet({ building: initialData, questId, visible, close }: Props) {
  const [sortedPlaces, setSortedPlaces] = useState<QuestPlace[]>([])
  const { data: building } = useQuestBuilding({ questId, buildingId: initialData.buildingId })
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  function reloadQuest() {
    queryClient.invalidateQueries({ queryKey: ["@quests", questId] })
  }

  async function deleteBuilding() {
    if (building) {
      if (!confirm(`[${building.name}] 건물을 정말 삭제하시겠습니까?`)) return
      await deleteQuestTargetBuilding(questId, building!)
      reloadQuest()
      close()
    }
  }

  const isConquered = (place: QuestPlace) => place.isConquered || place.isNotAccessible || place.isClosed

  function getSortedPlaces() {
    if (!building) return []
    const conquered = building.places.filter(isConquered)
    const notConquered = building.places.filter((p) => !isConquered(p))
    return [...notConquered, ...conquered].map((p) => building.places.find((b) => b.placeId === p.placeId) || p)
  }

  // 활동 중 장소 순서가 바뀌는 것을 막습니다.
  useMemo(() => {
    setSortedPlaces(getSortedPlaces())
  }, [initialData, building])

  // 다만 place가 삭제된 경우에만 장소를 다시 렌더링 해줍니다.
  useEffect(() => {
    const newSortedPlaces = getSortedPlaces()
    if (sortedPlaces.length !== newSortedPlaces.length) {
      setSortedPlaces(newSortedPlaces)
    }
  }, [initialData, building])

  if (!building) return null

  const conquered = building.places.filter(isConquered)
  const title = (
    <S.CustomTitle>
      <h5>{building.name}</h5>
      <S.ReloadButton onClick={reloadQuest}>
        <Reload size={24} />
      </S.ReloadButton>
      {isAuthenticated && (
        <S.DeleteButton onClick={deleteBuilding}>
          <Image src={deleteIcon} alt="삭제" style={{ width: 24, height: 24 }} />
        </S.DeleteButton>
      )}
    </S.CustomTitle>
  )

  return (
    <RightSheet visible={visible} close={close} title={title} style={{ width: "360px" }}>
      <S.GuideMessage style={{ marginTop: 24 }}>
        <S.Status>
          {conquered.length === building.places.length ? (
            <>
              <b>정복 완료 </b>
              <Image
                src="/marker_conquered.png"
                alt="flag"
                width={16}
                height={16}
                style={{ display: "inline-block" }}
              />
            </>
          ) : (
            <>
              퀘스트 상태 <b>{conquered.length}</b>/{building.places.length}
              <br />
              <small>{`*앱에서 장소 등록 시, '정복대상'이 '정복완료'로 자동 반영됩니다.`}</small>
            </>
          )}
        </S.Status>
      </S.GuideMessage>
      <S.Header>
        <S.ChcekcboxLabel>폐업</S.ChcekcboxLabel>
        <S.ChcekcboxLabel>접근불가</S.ChcekcboxLabel>
      </S.Header>
      {sortedPlaces.map((place) => (
        <PlaceCard place={place} questId={questId} key={place.placeId} onDelete={reloadQuest} />
      ))}
    </RightSheet>
  )
}
