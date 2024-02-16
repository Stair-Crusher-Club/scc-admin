import { BasicModalProps } from "@reactleaf/modal"

import { useQuest } from "@/lib/apis/api"
import { QuestBuilding } from "@/lib/models/quest"

import { css } from "@/styles/css"

import RightSheet from "../_template/RightSheet"
import * as S from "./QuestSummarySheet.style"

// import PlaceRow from "./PlaceRow"

interface Props extends BasicModalProps {
  questId: string
}

export const defaultOverlayOptions = { closeDelay: 200, dim: false }
export default function QuestSummarySheet({ questId, visible, close }: Props) {
  const { data: quest } = useQuest({ id: questId })

  return (
    <RightSheet visible={visible} close={close} title={quest?.name} style={{ width: "360px" }}>
      <S.TableWrapper>
        <S.BuildingTable>
          <colgroup>
            <col />
            <col width="72px" />
            <col width="72px" />
            <col width="72px" />
          </colgroup>
          <tbody>
            <S.HeaderRow>
              <S.HeaderCell style={{ textAlign: "left" }}>건불 번호</S.HeaderCell>
              <S.HeaderCell>장소 수</S.HeaderCell>
              <S.HeaderCell>정복</S.HeaderCell>
              <S.HeaderCell>폐업 및 접근불가</S.HeaderCell>
            </S.HeaderRow>
            {quest?.buildings.map((building) => (
              <tr key={building.buildingId} className={css({ _hover: { backgroundColor: "var(--leaf-primary-98)" } })}>
                <S.Cell style={{ textAlign: "left", lineHeight: 1.5 }}>{building.name}</S.Cell>
                <S.Cell>{building.places.length}</S.Cell>
                <S.Cell>{building.places.filter((p) => p.isConquered).length}</S.Cell>
                <S.Cell>{building.places.filter((p) => p.isClosed || p.isNotAccessible).length}</S.Cell>
              </tr>
            ))}
          </tbody>
        </S.BuildingTable>
      </S.TableWrapper>
    </RightSheet>
  )
}
