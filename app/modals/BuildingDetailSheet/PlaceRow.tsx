import { useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

import { updateQuestStatus } from "@/lib/apis/api"
import { QuestPlace } from "@/lib/models/quest"

import Checkbox from "@/components/Checkbox"

import * as S from "./PlaceRow.style"
import naverMapIcon from "../../../public/naver_map.jpg"

interface Props {
  place: QuestPlace
  questId: string
}

export default function PlaceRow({ place, questId }: Props) {
  const form = useForm({ defaultValues: { isClosed: place.isClosed, isNotAccessible: place.isNotAccessible } })
  const [isClosed, isNotAccessible] = form.watch(["isClosed", "isNotAccessible"])
  const visited = place.isConquered || isClosed || isNotAccessible
  const isBadPlace = place.isClosed || place.isNotAccessible
  const queryClient = useQueryClient()
  const updateStatus = useMutation({
    mutationFn: updateQuestStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@quests", questId] })
    },
  })

  const updateClosed = (isClosed: boolean) => {
    updateStatus.mutateAsync({
      questId,
      buildingId: place.buildingId,
      placeId: place.placeId,
      isClosed,
    })
  }

  const updateNotAccessible = (isNotAccessible: boolean) => {
    updateStatus.mutate({
      questId,
      buildingId: place.buildingId,
      placeId: place.placeId,
      isNotAccessible,
    })
  }

  function openNaverMap() {
    const isMobile = false
    if (isMobile) {
      window.open(`nmap://search?query=${place.name}`)
    } else {
      window.open(`https://map.naver.com/p/search/${place.name}`)
    }
  }

  return (
    <tr>
      <S.Cell style={{ textAlign: "left", lineHeight: 1.5 }}>
        {place.name}
        <S.ExternalMap onClick={openNaverMap}>
          <Image src={naverMapIcon} alt="네이버 지도" />
        </S.ExternalMap>
      </S.Cell>
      <S.Cell>
        <Checkbox
          id={place.placeId}
          checked={visited}
          disabled
          style={isBadPlace ? { backgroundColor: "#d4d7d9", borderColor: "#d4d7d9" } : {}}
        />
      </S.Cell>
      <S.Cell>
        <Checkbox
          id={place.placeId}
          checked={place.isClosedExpected}
          disabled
        />
      </S.Cell>
      <S.Cell>
        <Controller
          name="isClosed"
          control={form.control}
          render={({ field }) => (
            <Checkbox
              id={place.placeId + "-is-closed"}
              checked={field.value}
              onChange={(isClosed) => {
                field.onChange(isClosed)
                updateClosed(isClosed)
              }}
            />
          )}
        />
      </S.Cell>
      <S.Cell>
        <Controller
          name="isNotAccessible"
          control={form.control}
          render={({ field }) => (
            <Checkbox
              id={place.placeId + "-not-accessible"}
              checked={field.value}
              onChange={(isNotAccessible) => {
                field.onChange(isNotAccessible)
                updateNotAccessible(isNotAccessible)
              }}
            />
          )}
        />
      </S.Cell>
    </tr>
  )
}
