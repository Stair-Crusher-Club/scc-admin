import { useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-toastify"

import { updateQuestStatus } from "@/lib/apis/api"
import { QuestPlace } from "@/lib/models/quest"

import naverMapIcon from "../../../public/naver_map.jpg"
import * as S from "./PlaceCard.style"

interface Props {
  place: QuestPlace
  questId: string
}
export default function PlaceCard({ place, questId }: Props) {
  const [isClosed, setClosed] = useState(place.isClosed)
  const [isNotAccessible, setNotAccessible] = useState(place.isNotAccessible)
  const noInfo = !place.isConquered && !isClosed && !isNotAccessible
  const visited = place.isConquered || isClosed || isNotAccessible
  const isReversible = !place.isConquered && (isClosed || isNotAccessible)

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

  async function copyPlaceName() {
    await navigator.clipboard.writeText(place.name)
    toast.success("장소명을 복사했습니다.")
  }

  function openInApp() {
    toast.info("앱에서 열기 : 준비중입니다.")
  }

  const updateClosed = async (isClosed: boolean) => {
    await updateStatus.mutateAsync({
      questId,
      buildingId: place.buildingId,
      placeId: place.placeId,
      isClosed,
    })
    setClosed(isClosed)
  }

  const updateNotAccessible = async (isNotAccessible: boolean) => {
    await updateStatus.mutate({
      questId,
      buildingId: place.buildingId,
      placeId: place.placeId,
      isNotAccessible,
    })
    setNotAccessible(isNotAccessible)
  }

  const revertUpdate = () => {
    if (isNotAccessible) {
      updateNotAccessible(false)
    }
    if (isClosed) {
      updateClosed(false)
    }
  }

  return (
    <S.PlaceCard>
      <S.Header>
        <S.PlaceName>
          {place.name}
          {place.isConquered && <S.PlaceStatusBadge status="good">정복</S.PlaceStatusBadge>}
          {!isClosed && place.isClosedExpected && <S.PlaceStatusBadge status="warn">폐업추정</S.PlaceStatusBadge>}
          {isClosed && <S.PlaceStatusBadge status="bad">폐업확인</S.PlaceStatusBadge>}
          {isNotAccessible && <S.PlaceStatusBadge status="bad">접근불가</S.PlaceStatusBadge>}
        </S.PlaceName>
        <S.Buttons>
          <S.Button onClick={openNaverMap}>
            <Image src={naverMapIcon} alt="네이버 지도" style={{ width: 32, height: 32 }} />
          </S.Button>
          <S.Button onClick={copyPlaceName}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="11" y="5" width="16" height="16" rx="4" stroke="#777" stroke-width="2" />
              <rect x="5" y="11" width="16" height="16" rx="4" fill="white" stroke="#777" stroke-width="2" />
            </svg>
          </S.Button>
        </S.Buttons>
      </S.Header>
      {(isReversible || !visited) && (
        <S.Body>
          {isReversible && <S.RevertButton onClick={revertUpdate}>다시 입력할게요</S.RevertButton>}
          {!visited && <S.ConquerButton onClick={openInApp}>정복하기</S.ConquerButton>}
          {!visited && <S.ClosedConfirm onClick={() => updateClosed(true)}>폐업했어요</S.ClosedConfirm>}
          {!visited && <S.NotAccessible onClick={() => updateNotAccessible(true)}>접근불가</S.NotAccessible>}
        </S.Body>
      )}
    </S.PlaceCard>
  )
}
