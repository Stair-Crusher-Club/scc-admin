import { BasicModalProps } from "@reactleaf/modal"

import { QuestBuilding } from "@/lib/models/quest"

import RightSheet from "../_template/RightSheet"
import * as S from "./BuildingDetailSheet.style"
import PlaceRow from "./PlaceRow"

interface Props extends BasicModalProps {
  building: QuestBuilding
  questId: string
}

export const defaultOverlayOptions = { closeDelay: 200, dim: false }
export default function BuildingDetailSheet({ building, questId, visible, close }: Props) {
  return (
    <RightSheet visible={visible} close={close} title={building.name} style={{ width: "360px" }}>
      <S.TableWrapper>
        <S.PlaceTable>
          <colgroup>
            <col />
            <col width="54px" />
            <col width="54px" />
            <col width="54px" />
            <col width="54px" />
          </colgroup>
          <tbody>
            <S.HeaderRow>
              <S.HeaderCell style={{ textAlign: "left" }}>업체명</S.HeaderCell>
              <S.HeaderCell>정복</S.HeaderCell>
              <S.HeaderCell>폐업 추정</S.HeaderCell>
              <S.HeaderCell>폐업</S.HeaderCell>
              <S.HeaderCell>접근 불가</S.HeaderCell>
            </S.HeaderRow>
            {building.places.map((place) => (
              <PlaceRow place={place} questId={questId} key={place.placeId} />
            ))}
          </tbody>
        </S.PlaceTable>
      </S.TableWrapper>
    </RightSheet>
  )
}
