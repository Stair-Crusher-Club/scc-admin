import { useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useMediaQuery } from "react-responsive"

import { deleteQuestTargetPlace, updateQuestStatus } from "@/lib/apis/api"
import { ClubQuestTargetPlaceDTO } from "@/lib/generated-sources/openapi"
import { storage } from "@/lib/storage"

import Checkbox from "@/components/Checkbox"

import deleteIcon from "../../../public/delete_button.png"
import naverMapIcon from "../../../public/naver_map.jpg"
import stairCrusherIcon from "../../../public/scc_button.png"
import * as S from "./PlaceCard.style"

interface Props {
  place: ClubQuestTargetPlaceDTO
  questId: string
  onUpdate?: (place: ClubQuestTargetPlaceDTO) => void
  onDelete?: (place: ClubQuestTargetPlaceDTO) => void
}
export default function PlaceCard({ place, questId, onUpdate, onDelete }: Props) {
  const [isClosed, setClosed] = useState(place.isClosed)
  const [isNotAccessible, setNotAccessible] = useState(place.isNotAccessible)
  const [authenticated, setAuthenticated] = useState<boolean>()
  const isMobile = useMediaQuery({ maxWidth: 800 })

  useEffect(() => {
    const token = storage.get("token")
    if (token) {
      setAuthenticated(true)
    } else {
      setAuthenticated(false)
    }
  }, [])

  const queryClient = useQueryClient()
  const updateStatus = useMutation({
    mutationFn: updateQuestStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@quests", questId] })
    },
  })

  function openNaverMap() {
    const isMobile = false
    if (isMobile) {
      window.open(`nmap://search?query=${place.name}`)
    } else {
      window.open(`https://map.naver.com/p/search/${place.name}`)
    }
  }

  function openInApp() {
    if (isMobile) {
      window.location.href = `stair-crusher://place/${place.placeId}`
    } else {
      // FIXME: 유니버셜 링크로 연동해두기
      // window.open(`https://stair-crusher.com/place/${place.placeId}`)
    }
  }

  const updateClosed = async (isClosed: boolean) => {
    console.log({ name: place.name, placeId: place.placeId, isClosed, isNotAccessible })
    await updateStatus.mutateAsync({
      questId,
      buildingId: place.buildingId,
      placeId: place.placeId,
      isClosed,
    })
    onUpdate?.({ ...place, isClosed })
    setClosed(isClosed)
  }

  const updateNotAccessible = async (isNotAccessible: boolean) => {
    await updateStatus.mutate({
      questId,
      buildingId: place.buildingId,
      placeId: place.placeId,
      isNotAccessible,
    })
    console.log({ name: place.name, placeId: place.placeId, isClosed, isNotAccessible })
    onUpdate?.({ ...place, isNotAccessible })
    setNotAccessible(isNotAccessible)
  }

  const deletePlace = async () => {
    if (!confirm(`[${place.name}] 장소를 정말 삭제하시겠습니까?`)) return
    await deleteQuestTargetPlace(questId, place)
    onDelete?.(place)
  }

  return (
    <S.PlaceCard>
      <S.NameColumn>
        <S.Badges>
          {!place.isConquered && !isClosed && !isNotAccessible && (
            <S.PlaceStatusBadge status="normal">정복대상</S.PlaceStatusBadge>
          )}
          {place.isConquered && <S.PlaceStatusBadge status="good">정복완료</S.PlaceStatusBadge>}
          {isClosed && <S.PlaceStatusBadge status="warn">폐업확인</S.PlaceStatusBadge>}
          {isNotAccessible && <S.PlaceStatusBadge status="warn">건너뛰기</S.PlaceStatusBadge>}
          {!place.isConquered && !isClosed && place.isClosedExpected && (
            <S.PlaceStatusBadge status="unknown">폐업추정</S.PlaceStatusBadge>
          )}
        </S.Badges>
        <S.PlaceName>
          <span>{place.name}</span>
          <S.Button onClick={openInApp}>
            <Image src={stairCrusherIcon} alt="계단뿌셔클럽" style={{ width: 24, height: 24 }} />
          </S.Button>
          <S.Button onClick={openNaverMap}>
            <Image src={naverMapIcon} alt="네이버 지도" style={{ width: 24, height: 24 }} />
          </S.Button>
          {authenticated ? (
            <S.Button onClick={deletePlace}>
              <Image src={deleteIcon} alt="삭제 " style={{ width: 24, height: 24 }} />
            </S.Button>
          ) : null}
        </S.PlaceName>
      </S.NameColumn>
      <S.ActionsColumn>
        <S.CheckboxWrapper>
          <Checkbox
            id={`closed-${place.placeId}`}
            checked={isClosed}
            disabled={place.isConquered || isNotAccessible}
            onChange={updateClosed}
          />
        </S.CheckboxWrapper>
        <S.CheckboxWrapper>
          <Checkbox
            id={`notAccessible-${place.placeId}`}
            checked={isNotAccessible}
            disabled={place.isConquered || isClosed}
            onChange={updateNotAccessible}
          />
        </S.CheckboxWrapper>
      </S.ActionsColumn>
    </S.PlaceCard>
  )
}
