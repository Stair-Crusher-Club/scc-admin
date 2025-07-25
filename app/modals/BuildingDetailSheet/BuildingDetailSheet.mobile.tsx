import { BasicModalProps } from "@reactleaf/modal"
import { useQueryClient } from "@tanstack/react-query"
import { useAtom } from "jotai"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

import { deleteQuestTargetBuilding, useQuestBuilding } from "@/lib/apis/api"
import { AppState } from "@/lib/globalAtoms"
import { ClubQuestTargetBuildingDTO, ClubQuestTargetPlaceDTO } from "@/lib/generated-sources/openapi"
import { storage } from "@/lib/storage"

import Reload from "@/icons/Reload"
import BottomSheet from "@/modals/_template/BottomSheet"

import deleteIcon from "../../../public/delete_button.png"
import * as S from "./BuildingDetailSheet.style"
import PlaceCard from "./PlaceCard"

interface Props extends BasicModalProps {
  building: ClubQuestTargetBuildingDTO
  questId: string
}

export const defaultOverlayOptions = { closeDelay: 200, dim: false }
export default function BuildingDetailSheet({ building: initialData, questId, visible, close }: Props) {
  const [sortedPlaces, setSortedPlaces] = useState<ClubQuestTargetPlaceDTO[]>([])
  const { data: building } = useQuestBuilding({ questId, buildingId: initialData.buildingId })
  const [appState, setAppState] = useAtom(AppState)
  const queryClient = useQueryClient()
  const [authenticated, setAuthenticated] = useState<boolean>()
  useEffect(() => {
    const token = storage.get("token")
    if (token) {
      setAuthenticated(true)
    } else {
      setAuthenticated(false)
    }
  }, [])

  useEffect(() => {
    setAppState((prev) => ({ ...prev, isHeaderHidden: true }))
    return () => {
      setAppState((prev) => ({ ...prev, isHeaderHidden: false }))
    }
  }, [])

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

  const isConquered = (place: ClubQuestTargetPlaceDTO) => place.isConquered || place.isNotAccessible || place.isClosed

  function getSortedPlaces() {
    if (!building) return []
    const conquered = building.places.filter(isConquered).toSorted((a, b) => a.name.localeCompare(b.name))
    const notConquered = building.places.filter((p) => !isConquered(p)).toSorted((a, b) => a.name.localeCompare(b.name))
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
      {authenticated ? (
        <S.DeleteButton onClick={deleteBuilding}>
          <Image src={deleteIcon} alt="삭제 " style={{ width: 32, height: 32 }} />
        </S.DeleteButton>
      ) : null}
    </S.CustomTitle>
  )

  return (
    <BottomSheet visible={visible} close={close} title={title} style={{ height: "calc(100vh - 300px)" }}>
      <S.GuideMessage>
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
        <S.ChcekcboxLabel>건너뛰기</S.ChcekcboxLabel>
      </S.Header>
      {sortedPlaces.map((place) => (
        <PlaceCard key={place.placeId} place={place} questId={questId} onDelete={reloadQuest} />
      ))}
    </BottomSheet>
  )
}
