import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

import { updateQuestStatus } from "@/lib/apis/api"
import { QuestPlace } from "@/lib/models/quest"

import Checkbox from "@/components/Checkbox"

import * as S from "./PlaceRow.style"

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

  useEffect(() => {
    updateStatus.mutateAsync({
      questId,
      buildingId: place.buildingId,
      placeId: place.placeId,
      isClosed,
    })
  }, [isClosed])

  useEffect(() => {
    updateStatus.mutate({
      questId,
      buildingId: place.buildingId,
      placeId: place.placeId,
      isNotAccessible,
    })
  }, [isNotAccessible])

  return (
    <tr>
      <S.Cell style={{ textAlign: "left", lineHeight: 1.5 }}>{place.name}</S.Cell>
      <S.Cell>
        <Checkbox
          id={place.placeId}
          checked={visited}
          disabled
          style={isBadPlace ? { backgroundColor: "#d4d7d9", borderColor: "#d4d7d9" } : {}}
        />
      </S.Cell>
      <S.Cell>
        <Controller
          name="isClosed"
          control={form.control}
          render={({ field }) => (
            <Checkbox id={place.placeId + "-is-closed"} checked={field.value} onChange={field.onChange} />
          )}
        />
      </S.Cell>
      <S.Cell>
        <Controller
          name="isNotAccessible"
          control={form.control}
          render={({ field }) => (
            <Checkbox id={place.placeId + "-not-accessible"} checked={field.value} onChange={field.onChange} />
          )}
        />
      </S.Cell>
    </tr>
  )
}
