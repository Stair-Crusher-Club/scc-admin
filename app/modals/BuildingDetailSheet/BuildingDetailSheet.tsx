import { BasicModalProps } from "@reactleaf/modal"
import { useAtom } from "jotai"
import { useEffect } from "react"

import { AppState } from "@/lib/globalAtoms"
import { QuestBuilding, QuestPlace } from "@/lib/models/quest"

import Checkbox from "@/components/Checkbox/Checkbox"
import BottomSheet from "@/modals/_template/BottomSheet"

import * as S from "./BuildingDetailSheet.style"

interface Props extends BasicModalProps {
  building: QuestBuilding
}
export default function BuildingDetailSheet({ building, visible, close }: Props) {
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
            <PlaceRow place={place} key={place.placeId} />
          ))}
        </S.PlaceTable>
      </S.TableWrapper>
    </BottomSheet>
  )
}

function PlaceRow({ place }: { place: QuestPlace }) {
  const visited = place.isConquered || place.isClosed || place.isNotAccessible
  const isBadPlace = place.isClosed || place.isNotAccessible
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
        <Checkbox id={place.placeId + "-closed"} checked={place.isClosed} />
      </S.Cell>
      <S.Cell>
        <Checkbox id={place.placeId + "-not-accessible"} checked={place.isNotAccessible} />
      </S.Cell>
    </tr>
  )
}
