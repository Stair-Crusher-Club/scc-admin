import { BasicModalProps } from "@reactleaf/modal"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAtom } from "jotai"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

import { updateQuestStatus } from "@/lib/apis/api"
import { AppState } from "@/lib/globalAtoms"
import { QuestBuilding, QuestPlace } from "@/lib/models/quest"

import Checkbox from "@/components/Checkbox/Checkbox"
import BottomSheet from "@/modals/_template/BottomSheet"

import * as S from "./BuildingDetailSheet.style"

interface Props extends BasicModalProps {
  building: QuestBuilding
  questId: string
}
export default function BuildingDetailSheet({ building, questId, visible, close }: Props) {
  const [appState, setAppState] = useAtom(AppState)

  useEffect(() => {
    setAppState((prev) => ({ ...prev, isHeaderHidden: true }))
    return () => {
      setAppState((prev) => ({ ...prev, isHeaderHidden: false }))
    }
  }, [])

  return (
    <BottomSheet visible={visible} close={close} title={building.name} style={{ height: "calc(100vh - 300px)" }}>
      <S.TableWrapper>
        <S.PlaceTable>
          <colgroup>
            <col />
            <col width="72px" />
            <col width="72px" />
            <col width="72px" />
          </colgroup>
          <S.HeaderRow>
            <S.HeaderCell style={{ textAlign: "left" }}>업체명</S.HeaderCell>
            <S.HeaderCell>정복</S.HeaderCell>
            <S.HeaderCell>폐업</S.HeaderCell>
            <S.HeaderCell>접근불가</S.HeaderCell>
          </S.HeaderRow>
          {building.places.map((place) => (
            <PlaceRow place={place} questId={questId} key={place.placeId} />
          ))}
        </S.PlaceTable>
      </S.TableWrapper>
    </BottomSheet>
  )
}

function PlaceRow({ place, questId }: { place: QuestPlace; questId: string }) {
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
      <S.Cell style={{ textAlign: "left" }}>{place.name}</S.Cell>
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
        {/* <Checkbox id={place.placeId + "-closed"} checked={place.isClosed} onChange={updateClosedStatus} /> */}
      </S.Cell>
      <S.Cell>
        <Controller
          name="isNotAccessible"
          control={form.control}
          render={({ field }) => (
            <Checkbox id={place.placeId + "-not-accessible"} checked={field.value} onChange={field.onChange} />
          )}
        />
        {/* <Checkbox
          id={place.placeId + "-not-accessible"}
          checked={place.isNotAccessible}
          onChange={updateAccessibleStatus}
        /> */}
      </S.Cell>
    </tr>
  )
}
